// CV lens toggle — Alpine component. No build step; Alpine loaded from CDN.
// Filtering itself is pure CSS (see cv.css, driven by [data-lens] on the root).
// This only manages which lens is active + persistence + accessibility state.
(function () {
  var LENSES = ['full', 'dev', 'it', 'leader'];

  function register() {
    window.Alpine.data('cvLens', function () {
      return {
        lens: 'full',
        lenses: LENSES,
        init: function () {
          var fromHash = (location.hash || '').replace('#lens=', '');
          var saved = null;
          try { saved = localStorage.getItem('cv-lens'); } catch (e) {}
          var initial = LENSES.indexOf(fromHash) !== -1 ? fromHash
                      : (LENSES.indexOf(saved) !== -1 ? saved : 'full');
          this.lens = initial;
        },
        set: function (l) {
          if (LENSES.indexOf(l) === -1) return;
          this.lens = l;
          try { localStorage.setItem('cv-lens', l); } catch (e) {}
          if (history.replaceState) {
            history.replaceState(null, '', l === 'full' ? location.pathname : '#lens=' + l);
          }
        },
      };
    });
  }

  if (window.Alpine) register();
  else document.addEventListener('alpine:init', register);
})();
