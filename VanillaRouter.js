// VanillaRouter.js

class VanillaRouter {
    constructor(options = {}) {
      this.routes = [];
      this.mode = options.mode || 'history';
      this.root = options.root || '/';
      this.currentRoute = null;
      this.params = {};
      this.query = {};
      this.middlewares = {};
      this.notFoundHandler = options.notFoundHandler || (() => {});
      this.beforeEach = options.beforeEach || (() => true);
      this.afterEach = options.afterEach || (() => {});
    }
  
    add(path, handler, options = {}) {
      this.routes.push({ path, handler, options });
      return this;
    }
  
    remove(path) {
      this.routes = this.routes.filter(route => route.path !== path);
      return this;
    }
  
    flush() {
      this.routes = [];
      return this;
    }
  
    middleware(name, handler) {
      this.middlewares[name] = handler;
      return this;
    }
  
    navigate(path) {
      if (this.mode === 'history') {
        history.pushState(null, null, this.root + this.clearSlashes(path));
        this.resolve(this.getFragment());
      } else {
        window.location.href = window.location.href.replace(/#(.*)$/, '') + '#' + path;
      }
      return this;
    }
  
    resolve(path) {
      const fragment = this.getFragment(path);
      let match = null;
  
      for (let i = 0; i < this.routes.length; i++) {
        const route = this.routes[i];
        const keys = [];
        const regex = this.pathToRegexp(route.path, keys);
        const matched = regex.exec(fragment);
  
        if (matched) {
          match = {
            route: route,
            params: {},
            query: this.getQueryParams(fragment)
          };
          keys.forEach((key, index) => {
            match.params[key.name] = decodeURIComponent(matched[index + 1]);
          });
          break;
        }
      }
  
      if (!match) {
        this.notFoundHandler(fragment);
        return this;
      }
  
      this.currentRoute = match.route;
      this.params = match.params;
      this.query = match.query;
  
      const middlewares = (match.route.options.middleware || [])
        .map(name => this.middlewares[name])
        .filter(Boolean);
  
      const runMiddlewares = (index = 0) => {
        if (index < middlewares.length) {
          middlewares[index].call(this, () => runMiddlewares(index + 1), match);
        } else {
          if (this.beforeEach(match) !== false) {
            match.route.handler.call(this, match);
            this.afterEach(match);
          }
        }
      };
  
      runMiddlewares();
  
      return this;
    }
  
    listen() {
      const current = this.getFragment();
      const fn = () => {
        if (current !== this.getFragment()) {
          this.resolve(this.getFragment());
        }
      };
      clearInterval(this.interval);
      this.interval = setInterval(fn, 50);
      return this;
    }
  
    getFragment(path = null) {
      let fragment = '';
      if (this.mode === 'history') {
        fragment = this.clearSlashes(decodeURI(path || location.pathname + location.search));
        fragment = fragment.replace(/\?(.*)$/, '');
        fragment = this.root !== '/' ? fragment.replace(this.root, '') : fragment;
      } else {
        const match = path || window.location.href.match(/#(.*)$/);
        fragment = match ? match[1] : '';
      }
      return this.clearSlashes(fragment);
    }
  
    clearSlashes(path) {
      return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }
  
    getQueryParams(fragment) {
      const query = {};
      const parts = fragment.split('?');
      if (parts.length > 1) {
        const queryString = parts[1];
        const pairs = queryString.split('&');
        for (let i = 0; i < pairs.length; i++) {
          const pair = pairs[i].split('=');
          query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
        }
      }
      return query;
    }
  
    pathToRegexp(path, keys) {
      path = path
        .replace(/\/\(/g, '(?:/')
        .replace(/\+/g, '__plus__')
        .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g, (_, slash, format, key, capture, optional) => {
          keys.push({ name: key });
          slash = slash || '';
          return '' +
            (optional ? '' : slash) +
            '(?:' +
            (optional ? slash : '') +
            (format || '') +
            (capture || (format && '([^/.]+?)' || '([^/]+?)')) +
            ')' +
            (optional || '');
        })
        .replace(/([\/.])/g, '\\$1')
        .replace(/__plus__/g, '(.+)')
        .replace(/\*/g, '(.*)');
      return new RegExp('^' + path + '$', 'i');
    }
  }
  
  export default VanillaRouter;