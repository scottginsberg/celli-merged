class StoryGraphStore {
  constructor(nodes, storyConnections, songs = [], wikiArticles = []) {
    this.nodes = nodes;
    this.storyConnections = storyConnections;
    this.songs = songs;
    this.wikiArticles = wikiArticles;
    this.cast = [];
    this.timelineBeats = [];
    this.wikiIndex = new Map();
    this.songAdjacency = [];
  }

  buildGraph() {
    this.cast = this.collectCast();
    this.timelineBeats = this.collectTimelineBeats();
    this.indexWiki();
    this.songAdjacency = this.buildSongAdjacency();
    return {
      cast: this.cast,
      timelineBeats: this.timelineBeats,
      wikiArticles: this.wikiArticles,
      songs: this.songs,
      edges: this.getMeshEdges(),
    };
  }

  collectCast() {
    return Object.values(this.nodes).filter(node =>
      ["character", "deity", "primordial"].includes(node.type)
    );
  }

  collectTimelineBeats() {
    return Object.values(this.nodes).filter(node =>
      ["moment", "event", "scene", "story"].includes(node.type)
    );
  }

  indexWiki() {
    this.wikiIndex.clear();
    this.wikiArticles.forEach(article => {
      this.wikiIndex.set(article.id, article);
    });
  }

  buildSongAdjacency() {
    return this.songs.map(song => {
      const cast = (song.castIds || []).map(id => this.nodes[id]).filter(Boolean);
      const beats = (song.timelineBeatIds || []).map(id => this.nodes[id]).filter(Boolean);
      const wiki = (song.wikiArticleIds || []).map(id => this.wikiIndex.get(id)).filter(Boolean);
      const series = this.storyConnections
        .filter(conn => cast.some(c => c.id === conn.characterId))
        .map(conn => this.nodes[conn.seriesId])
        .filter(Boolean);

      return { song, cast, beats, wiki, series };
    });
  }

  getStorySongCastAdjacency() {
    return this.songAdjacency;
  }

  getMeshEdges() {
    const edges = [];
    this.songAdjacency.forEach(bundle => {
      bundle.cast.forEach(castNode => {
        edges.push({ from: bundle.song.id, to: castNode.id, type: "cast" });
      });
      bundle.beats.forEach(beat => {
        edges.push({ from: bundle.song.id, to: beat.id, type: "timeline" });
      });
      bundle.wiki.forEach(article => {
        edges.push({ from: bundle.song.id, to: article.id, type: "wiki" });
      });
      bundle.series.forEach(series => {
        edges.push({ from: bundle.song.id, to: series.id, type: "series" });
      });
    });
    return edges;
  }

  getNowPresentingPulses(now = Date.now()) {
    const period = 1600;
    const base = this.songAdjacency.filter(bundle =>
      bundle.series.some(series => series?.id === "series_now_presenting") ||
      bundle.song.seriesId === "series_now_presenting"
    );

    return base.map((bundle, idx) => {
      const phase = ((now + idx * 180) % period) / period;
      const intensity = 0.55 + 0.45 * Math.sin(phase * Math.PI * 2);
      return {
        song: bundle.song,
        beats: bundle.beats,
        cast: bundle.cast,
        intensity,
      };
    });
  }

  getSummary() {
    return {
      castCount: this.cast.length,
      beatCount: this.timelineBeats.length,
      wikiCount: this.wikiArticles.length,
      songCount: this.songs.length,
      edgeCount: this.getMeshEdges().length,
    };
  }
}

if (typeof window !== "undefined") {
  window.StoryGraphStore = StoryGraphStore;
}
