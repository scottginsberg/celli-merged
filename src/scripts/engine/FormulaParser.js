/**
 * Formula Parser & Evaluator System
 * Extracted from merged2.html lines 14100-16500 (~2400 lines)
 * 
 * Complete formula parsing, evaluation, and dependency tracking system
 * 
 * Components:
 * - TokenTypes: Token type constants
 * - FormulaLexer: Tokenization and lexical analysis
 * - FormulaParser: AST (Abstract Syntax Tree) parsing
 * - FormulaEvaluator: AST evaluation and execution
 * - Formula: Main API wrapper with dependency tracking and recomputation
 */

import { Store } from './Store.js';
import { Write } from './Write.js';
import { Actions } from './Actions.js';
import { aKey, CHUNK_SIZE, chunkOf, keyChunk } from './Constants.js';

// Token types for lexer
const TokenTypes = {
  ILLEGAL: 'ILLEGAL',
  EOF: 'EOF',
  EQUALS: 'EQUALS',
  NUMBER: 'NUMBER',
  STRING: 'STRING',
  IDENTIFIER: 'IDENTIFIER',
  CELL_REF: 'CELL_REF',
  RANGE_REF: 'RANGE_REF',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  COMMA: 'COMMA',
  COLON: 'COLON',
  LBRACE: 'LBRACE',
  RBRACE: 'RBRACE',
  SEMICOLON: 'SEMICOLON'
};

/**
 * FormulaLexer - Tokenizes formula text
 */
class FormulaLexer {
  constructor(input) {
    this.input = input || '';
    this.position = 0;
    this.readPosition = 0;
    this.ch = null;
    this.readChar();
  }

  readChar() {
    if (this.readPosition >= this.input.length) {
      this.ch = null;
    } else {
      this.ch = this.input[this.readPosition];
    }
    this.position = this.readPosition;
    this.readPosition++;
  }

  peekChar() {
    if (this.readPosition >= this.input.length) return null;
    return this.input[this.readPosition];
  }

  skipWhitespace() {
    while (this.ch === ' ' || this.ch === '\t' || this.ch === '\n' || this.ch === '\r') {
      this.readChar();
    }
  }

  nextToken() {
    this.skipWhitespace();
    
    let tok;
    
    switch (this.ch) {
      case '=':
        tok = { type: TokenTypes.EQUALS, value: this.ch };
        break;
      case '(':
        tok = { type: TokenTypes.LPAREN, value: this.ch };
        break;
      case ')':
        tok = { type: TokenTypes.RPAREN, value: this.ch };
        break;
      case ',':
        tok = { type: TokenTypes.COMMA, value: this.ch };
        break;
      case ':':
        tok = { type: TokenTypes.COLON, value: this.ch };
        break;
      case '{':
        tok = { type: TokenTypes.LBRACE, value: this.ch };
        break;
      case '}':
        tok = { type: TokenTypes.RBRACE, value: this.ch };
        break;
      case ';':
        tok = { type: TokenTypes.SEMICOLON, value: this.ch };
        break;
      case '"':
        tok = { type: TokenTypes.STRING, value: this.readString() };
        break;
      case '`':
        tok = { type: TokenTypes.STRING, value: this.readRawString('`') };
        break;
      case '<':
        if (this.peekSequence('<<<')) {
          tok = { type: TokenTypes.STRING, value: this.readHeredoc() };
          return tok;
        }
        tok = { type: TokenTypes.ILLEGAL, value: this.ch };
        break;
      case '@':
        tok = { type: TokenTypes.RANGE_REF, value: this.readRangeRef() };
        break;
      case null:
        tok = { type: TokenTypes.EOF, value: "" };
        break;
      default:
        if (this.isLetter(this.ch)) {
          const literal = this.readIdentifier();
          if (this.isDigit(this.ch)) {
            const number = this.readNumber();
            const greek = 'αβγδεζηθικλμνξοπρστυφχψω';
            let greekChar = '';
            let arrayId = '';
            if (this.ch && greek.includes(this.ch)) {
              const g = this.ch;
              this.readChar();
              greekChar = g;
            }
            if (this.ch === '^') {
              this.readChar();
              arrayId = '^' + this.readNumber();
            }
            tok = { type: TokenTypes.CELL_REF, value: literal + number + greekChar + arrayId };
          } else {
            tok = { type: TokenTypes.IDENTIFIER, value: literal };
          }
          return tok;
        } else if (this.isDigit(this.ch)) {
          // Support identifiers starting with digit followed by letters (3D_TRANSLATE)
          const start = this.position;
          let i = this.position;
          let hasAlpha = false;
          let ch = this.input[i];
          while (ch && ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === '_')) {
            if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') hasAlpha = true;
            i++;
            ch = this.input[i];
          }
          if (hasAlpha) {
            while (this.position < i) this.readChar();
            tok = { type: TokenTypes.IDENTIFIER, value: this.input.substring(start, i) };
          } else {
            tok = { type: TokenTypes.NUMBER, value: this.readNumber() };
          }
          return tok;
        } else {
          tok = { type: TokenTypes.ILLEGAL, value: this.ch };
        }
    }
    
    this.readChar();
    return tok;
  }

  readString() {
    let out = '';
    while (true) {
      this.readChar();
      if (this.ch === null) break;
      if (this.ch === '"') break;
      if (this.ch === '\\') {
        const next = this.peekChar();
        if (next === null) {
          out += '\\';
          continue;
        }
        this.readChar();
        switch (this.ch) {
          case 'n': out += '\n'; break;
          case 'r': out += '\r'; break;
          case 't': out += '\t'; break;
          case '"': out += '"'; break;
          case '\\': out += '\\'; break;
          default: out += this.ch; break;
        }
        continue;
      }
      out += this.ch;
    }
    return out;
  }

  readRawString(delimiter) {
    let out = '';
    while (true) {
      this.readChar();
      if (this.ch === null) break;
      if (this.ch === delimiter) break;
      out += this.ch;
    }
    return out;
  }

  readHeredoc() {
    const start = this.position + 3;
    const end = this.input.indexOf('>>>', start);
    const value = end === -1 ? this.input.slice(start) : this.input.slice(start, end);
    const after = end === -1 ? this.input.length : end + 3;
    if (after >= this.input.length) {
      this.position = this.input.length;
      this.readPosition = this.input.length;
      this.ch = null;
    } else {
      this.position = after;
      this.ch = this.input[this.position];
      this.readPosition = this.position + 1;
    }
    return value;
  }

  peekSequence(seq) {
    if (!seq || !seq.length) return false;
    return this.input.substr(this.position, seq.length) === seq;
  }

  readIdentifier() {
    const position = this.position;
    while (this.isLetter(this.ch) || this.ch === '_') {
      this.readChar();
    }
    return this.input.substring(position, this.position);
  }

  readNumber() {
    const position = this.position;
    while (this.isDigit(this.ch) || this.ch === '.') {
      this.readChar();
    }
    return this.input.substring(position, this.position);
  }

  readRangeRef() {
    const position = this.position;
    while (this.ch !== null && this.ch !== ']') {
      this.readChar();
    }
    if (this.ch === ']') this.readChar();
    return this.input.substring(position, this.position);
  }

  isLetter(ch) {
    return ch && (('a' <= ch && ch <= 'z') || ('A' <= ch && ch <= 'Z'));
  }

  isDigit(ch) {
    return ch && ('0' <= ch && ch <= '9');
  }
}

/**
 * FormulaParser - Parses tokens into Abstract Syntax Tree
 */
class FormulaParser {
  constructor(lexer, anchor) {
    this.lexer = lexer;
    this.anchor = anchor;
    this.errors = [];
    this.currentToken = null;
    this.peekToken = null;
    this.nextToken();
    this.nextToken();
  }

  nextToken() {
    this.currentToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  parseFormula() {
    if (this.currentToken.type !== TokenTypes.EQUALS) {
      return {
        type: 'Literal',
        value: this.lexer.input
      };
    }
    this.nextToken(); // consume '='
    return this.parseExpression();
  }

  parseExpression() {
    if (this.currentToken.type === TokenTypes.IDENTIFIER && this.peekToken.type === TokenTypes.LPAREN) {
      return this.parseFunctionCall();
    }
    if (this.currentToken.type === TokenTypes.IDENTIFIER && this.peekToken.type === TokenTypes.LBRACE) {
      const name = this.currentToken.value.toUpperCase();
      if (name === 'DO' || name === 'SEQ') {
        return this.parseFunctionBlockCall(name);
      }
    }
    return this.parsePrimary();
  }

  parseFunctionCall() {
    const node = {
      type: 'FunctionCall',
      name: this.currentToken.value.toUpperCase(),
      arguments: [],
      raw: this.lexer.input
    };
    this.nextToken(); // consume IDENTIFIER
    this.nextToken(); // consume '('
    node.arguments = this.parseArgumentList();
    if (this.currentToken.type !== TokenTypes.RPAREN) {
      while (this.currentToken && this.currentToken.type !== TokenTypes.RPAREN && this.currentToken.type !== TokenTypes.EOF) {
        this.nextToken();
      }
      if (this.currentToken.type !== TokenTypes.RPAREN) {
        this.errors.push(`Expected ')', got ${this.currentToken ? this.currentToken.type : 'EOF'}`);
        return null;
      }
    }
    this.nextToken(); // consume ')'
    return node;
  }

  parseFunctionBlockCall(name) {
    const node = {
      type: 'FunctionCall',
      name,
      arguments: [],
      raw: this.lexer.input,
      block: true,
      withOptions: null
    };
    this.nextToken(); // consume IDENTIFIER
    this.nextToken(); // consume '{'
    node.arguments = this.parseActionBlock();
    if (this.currentToken.type !== TokenTypes.RBRACE) {
      this.errors.push(`Expected '}', got ${this.currentToken ? this.currentToken.type : 'EOF'}`);
    } else {
      this.nextToken(); // consume '}'
    }
    if (this.currentToken && this.currentToken.type === TokenTypes.IDENTIFIER && this.currentToken.value.toUpperCase() === 'WITH') {
      this.nextToken(); // consume WITH
      node.withOptions = this.parseWithOptions();
    }
    return node;
  }

  parseActionBlock() {
    const statements = [];
    while (this.currentToken && this.currentToken.type !== TokenTypes.RBRACE && this.currentToken.type !== TokenTypes.EOF) {
      if (this.currentToken.type === TokenTypes.SEMICOLON) {
        this.nextToken();
        continue;
      }
      const stmt = this.parseExpression();
      if (stmt) statements.push(stmt);
      if (this.currentToken && this.currentToken.type === TokenTypes.SEMICOLON) {
        this.nextToken();
      }
    }
    return statements;
  }

  parseWithOptions() {
    const opts = {};
    while (this.currentToken && this.currentToken.type !== TokenTypes.EOF) {
      if (this.currentToken.type !== TokenTypes.IDENTIFIER) break;
      const key = this.currentToken.value;
      this.nextToken();
      if (this.currentToken && this.currentToken.type === TokenTypes.COLON) {
        this.nextToken();
      }
      const value = this.parseExpression();
      if (value !== undefined) opts[key] = value;
      if (this.currentToken && this.currentToken.type === TokenTypes.COMMA) {
        this.nextToken();
        continue;
      }
      break;
    }
    return opts;
  }

  parseArgumentList() {
    const args = [];
    if (this.currentToken.type === TokenTypes.RPAREN) {
      return args;
    }
    
    while (this.currentToken && this.currentToken.type !== TokenTypes.RPAREN && this.currentToken.type !== TokenTypes.EOF) {
      const expr = this.parseExpression();
      if (expr !== undefined && expr !== null) args.push(expr);
      if (this.currentToken && this.currentToken.type === TokenTypes.COMMA) {
        this.nextToken();
        continue;
      }
      if (this.currentToken && this.currentToken.type === TokenTypes.RPAREN) break;
      if (this.currentToken && this.currentToken.type !== TokenTypes.COMMA) {
        break;
      }
    }
    return args;
  }

  parsePrimary() {
    switch (this.currentToken.type) {
      case TokenTypes.LPAREN:
        this.nextToken();
        const inner = this.parseExpression();
        if (this.currentToken.type !== TokenTypes.RPAREN) {
          while (this.currentToken && this.currentToken.type !== TokenTypes.RPAREN && this.currentToken.type !== TokenTypes.EOF) {
            this.nextToken();
          }
        }
        if (this.currentToken.type === TokenTypes.RPAREN) this.nextToken();
        return inner;
      case TokenTypes.NUMBER:
        const num = parseFloat(this.currentToken.value);
        this.nextToken();
        return { type: 'Number', value: num };
      case TokenTypes.STRING:
        const str = this.currentToken.value;
        this.nextToken();
        return { type: 'String', value: str };
      case TokenTypes.CELL_REF:
        const cellRef = this.parseCellRef(this.currentToken.value);
        this.nextToken();
        if (this.currentToken && this.currentToken.type === TokenTypes.COLON) {
          this.nextToken(); // consume ':'
          if (this.currentToken.type === TokenTypes.CELL_REF) {
            const endRef = this.parseCellRef(this.currentToken.value);
            this.nextToken();
            return { type: 'Range', start: cellRef, end: endRef, kind: 'range' };
          }
        }
        return { type: 'CellRef', ...cellRef, kind: 'ref' };
      case TokenTypes.RANGE_REF:
        const rangeRef = this.parseRangeRef(this.currentToken.value);
        this.nextToken();
        return { type: 'RangeRef', ...rangeRef, kind: 'ref' };
      case TokenTypes.IDENTIFIER:
        if (this.peekToken && this.peekToken.type === TokenTypes.LPAREN) {
          return this.parseFunctionCall();
        }
        const name = this.currentToken.value.toUpperCase();
        const macro = Store.getState().namedMacros.get(name);
        this.nextToken();
        if (macro) {
          return { type: 'Macro', value: macro };
        }
        return { type: 'Identifier', value: name };
      default:
        this.errors.push(`Unexpected token: ${this.currentToken.type}`);
        const val = this.currentToken.value;
        this.nextToken();
        return { type: 'Literal', value: val };
    }
  }

  parseCellRef(s) {
    const t = String(s || '').trim();
    const m = /^([A-Za-z]+)(\d+)([\u03b1-\u03c9])?(?:\^(-?\d+))?$/.exec(t);
    if (!m) return null;
    let x = 0;
    const letters = m[1].toUpperCase();
    for (let i = 0; i < letters.length; i++) x = x * 26 + (letters.charCodeAt(i) - 64);
    x--;
    const y = +m[2] - 1;
    const G = 'αβγδεζηθικλμνξοπρστυφχψω';
    const z = m[3] ? G.indexOf(m[3]) : this.anchor.z;
    const arrId = m[4] !== undefined ? (+m[4]) : this.anchor.arrId;
    return { x, y, z, arrId, raw: t };
  }

  parseRangeRef(s) {
    const cur = this.anchor || { x: 0, y: 0, z: 0, arrId: 0 };
    const m = /^@\[(\-?\d+)?,(\-?\d+)?,(\-?\d+)?,(-?\d+)\]$/.exec(String(s).trim());
    if (!m) return null;
    const raw = [m[1], m[2], m[3]].map(v => (v === undefined || v === null) ? '' : String(v));
    const toOneBased = (val, curComp) => {
      if (val === '') return 1;
      const n = +val;
      if (n === 0) return (curComp | 0) + 1;
      return n;
    };
    const xb = toOneBased(raw[0], cur.x);
    const yb = toOneBased(raw[1], cur.y);
    const zb = toOneBased(raw[2], cur.z);
    return { x: xb - 1, y: yb - 1, z: zb - 1, arrId: +m[4], raw: String(s).trim() };
  }
}

/**
 * FormulaEvaluator - Evaluates AST nodes
 */
class FormulaEvaluator {
  constructor(formulaAPI) {
    this.formulaAPI = formulaAPI;
  }

  evaluate(node) {
    if (!node) return null;
    
    switch (node.type) {
      case 'Literal':
        return node.value;
      case 'Number':
        return node.value;
      case 'String':
        return node.value;
      case 'Identifier':
        return node.value;
      case 'Macro':
        return node.value;
      case 'CellRef':
        return this.formulaAPI.getCellValue(node);
      case 'RangeRef':
        return this.formulaAPI.getCellValue(node);
      case 'Range':
        const cells = [];
        const start = node.start, end = node.end;
        const xs = [start.x, end.x].sort((a, b) => a - b);
        const ys = [start.y, end.y].sort((a, b) => a - b);
        const zs = [start.z, end.z].sort((a, b) => a - b);
        for (let z = zs[0]; z <= zs[1]; z++) {
          for (let y = ys[0]; y <= ys[1]; y++) {
            for (let x = xs[0]; x <= xs[1]; x++) {
              cells.push({ x, y, z, arrId: start.arrId, kind: 'ref' });
            }
          }
        }
        return { kind: 'range', cells };
      case 'FunctionCall':
        const fn = this.formulaAPI.Fn[node.name];
        if (!fn) {
          throw new Error(`Unknown function ${node.name}`);
        }
        
        let convertedArgs = node.arguments.map(arg => this.convertAstToLegacy(arg));
        const mockAst = {
          fn: node.name,
          args: convertedArgs,
          raw: node.raw || this.formulaAPI.rawFormula
        };
        
        const anchor = this.formulaAPI.currentAnchor;
        const arr = this.formulaAPI.currentArray;
        const tx = this.formulaAPI.currentTx;
        
        return fn.impl(anchor, arr, mockAst, tx);
    }
    return null;
  }

  convertAstToLegacy(node) {
    switch (node.type) {
      case 'Number':
        return node.value;
      case 'String':
        return node.value;
      case 'Literal':
        return node.value;
      case 'CellRef':
      case 'RangeRef':
        return { ...node, kind: 'ref' };
      case 'Range':
        return this.evaluate(node);
      case 'FunctionCall':
        return this.evaluate(node);
      default:
        return node.value || '';
    }
  }

  findDependencies(node) {
    const deps = new Set();
    const aKeyFn = ({ arrId, x, y, z }) => `${arrId}:${x},${y},${z}`;
    
    const walk = (n) => {
      if (!n) return;
      
      switch (n.type) {
        case 'CellRef':
        case 'RangeRef':
          deps.add(aKeyFn(n));
          break;
        case 'Range':
          deps.add(aKeyFn(n.start));
          deps.add(aKeyFn(n.end));
          break;
        case 'FunctionCall':
          n.arguments.forEach(walk);
          break;
      }
    };
    
    walk(node);
    return deps;
  }
}

// Export classes for use in Formula wrapper and elsewhere
export { TokenTypes, FormulaLexer, FormulaParser, FormulaEvaluator };

/**
 * NOTE: The complete Formula wrapper with executeAt, recomputeAnchors, etc. 
 * will need access to global Fn registry and Scene.
 * This should be initialized at runtime with proper dependencies.
 * See merged2.html lines ~14820-16500 for the full Formula wrapper implementation.
 */



