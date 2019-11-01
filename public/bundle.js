
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.ctx, definition[1](fn ? fn(ctx) : {})))
            : ctx.$$scope.ctx;
    }
    function get_slot_changes(definition, ctx, changed, fn) {
        return definition[1]
            ? assign({}, assign(ctx.$$scope.changed || {}, definition[1](fn ? fn(changed) : {})))
            : ctx.$$scope.changed || {};
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = key && { [key]: value };
            const child_ctx = assign(assign({}, info.ctx), info.resolved);
            const block = type && (info.current = type)(child_ctx);
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                flush();
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = { [info.value]: promise };
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    function links(node, { history }) {
      function onClick(e) {
        e.stopPropagation();
        let current = e.target;

        while (current && current.tagName !== 'A') {
          current = current.parentElement;
        }

        if (
          current &&
          !['_self', '_blank', '_top', '_parent'].includes(
            current.getAttribute('target'),
          )
        ) {
          const action = current.getAttribute('replace') ? 'replace' : 'push';
          const href = current.getAttribute('href');
          if (!['//', 'http'].find(rule => href.startsWith(rule))) {
            e.preventDefault();
            history[action](href);
          }
        }
      }

      node.addEventListener('click', onClick);

      return {
        destroy() {
          node.removeEventListener('click', onClick);
        },
      };
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    /**
     * Derived value store by synchronizing one or more readable stores and
     * applying an aggregation function over its input values.
     * @param {Stores} stores input stores
     * @param {function(Stores=, function(*)=):*}fn function callback that aggregates the values
     * @param {*=}initial_value when used asynchronously
     */
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => store.subscribe((value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    const CONTEXT_KEY = '_protection';

    function createProtection() {
      setContext(CONTEXT_KEY, []);
    }

    function createLocalProtection(initial) {
      const localProtection = writable(initial);
      setContext(CONTEXT_KEY, [...getContext(CONTEXT_KEY), localProtection]);
      return localProtection;
    }

    function getProtected() {
      return derived(getContext(CONTEXT_KEY), protections =>
        protections.reduce((acc, next) => acc && next, true),
      );
    }

    function createBaseHistory(initialPath) {
      let _isBlocked = false;
      let _isLeaving = false;
      let _leaveListeners = [];
      let currentPath = writable(initialPath);

      function setPath(path) {
        currentPath.set(path);
      }

      function block() {
        _isBlocked = true;
      }

      function unblock() {
        _isBlocked = false;
        _isLeaving = false;
      }

      function isBlocked() {
        return _isBlocked;
      }

      function wasTriedToLeave() {
        if (!_isLeaving) {
          _isLeaving = true;
          _leaveListeners.forEach(listener => listener(_isLeaving));
        }
      }

      function acceptLeave() {
        unblock();
      }

      function cancelLeave() {
        _isLeaving = false;
        _leaveListeners.forEach(listener => listener(_isLeaving));
      }

      function onLeave(callback) {
        _leaveListeners.push(callback);
      }

      function offLeave(callback) {
        _leaveListeners = _leaveListeners.filter(listener => listener !== callback);
      }

      return {
        setPath,
        block,
        unblock,
        isBlocked,
        acceptLeave,
        cancelLeave,
        onLeave,
        offLeave,
        wasTriedToLeave,
        currentPath: { subscribe: currentPath.subscribe },
      };
    }

    const globalHistory = window.history;

    function createBrowserHistory() {
      const {
        currentPath,
        setPath,
        block,
        unblock,
        isBlocked,
        acceptLeave,
        cancelLeave,
        onLeave,
        offLeave,
        wasTriedToLeave,
      } = createBaseHistory(getCurrentPath());

      let isStateChangedFromUI = false;
      let pendingAction = null;
      let currentState = globalHistory.state || 0;

      globalHistory.replaceState(currentState, '', getCurrentPath());

      function push(to) {
        if (isBlocked()) return [push, [to]];
        globalHistory.pushState(++currentState, null, to);
        setCurrentPath();
      }

      function back() {
        if (isBlocked()) return [back, []];
        isStateChangedFromUI = true;
        globalHistory.back();
        currentState--;
      }

      function forward() {
        if (isBlocked()) return [forward, []];
        isStateChangedFromUI = true;
        globalHistory.forward();
        currentState++;
      }

      function replace(to) {
        if (isBlocked()) return [replace, [to]];
        globalHistory.replaceState(currentState, null, to);
        setCurrentPath();
      }

      function onStateChange(e) {
        if (isStateChangedFromUI) {
          setCurrentPath();
          isStateChangedFromUI = false;
          return;
        }

        if (isBlocked()) {
          globalHistory[e.state < currentState ? 'forward' : 'back']();
          isStateChangedFromUI = true;
          return [e.state < currentState ? back : forward, []];
        }
        currentState = e.state;
        setCurrentPath();
      }

      function wrapAfterAction(action) {
        return (...args) => {
          const presentedPendingAction = action(...args);
          if (presentedPendingAction) {
            pendingAction = presentedPendingAction;
            wasTriedToLeave();
          }
        };
      }

      function onAcceptLeave() {
        acceptLeave();
        const [fn, args] = pendingAction;
        fn(...args);
      }

      function onPageUnload(e) {
        if (isBlocked()) {
          e.returnValue = '';
          return 'Are you sure?';
        }
      }

      function getCurrentPath() {
        return `${location.pathname}${location.search}${location.hash}`;
      }

      function setCurrentPath() {
        setPath(getCurrentPath());
      }

      const wrappedOnStateChange = wrapAfterAction(onStateChange);

      window.addEventListener('popstate', wrappedOnStateChange);
      window.addEventListener('beforeunload', onPageUnload);

      onDestroy(() => {
        pendingAction = null;
        window.removeEventListener('popstate', wrappedOnStateChange);
        window.removeEventListener('beforeunload', onPageUnload);
      });

      return {
        currentPath,
        push: wrapAfterAction(push),
        back: wrapAfterAction(back),
        forward: wrapAfterAction(forward),
        replace: wrapAfterAction(replace),
        block,
        unblock,
        acceptLeave: onAcceptLeave,
        cancelLeave,
        onLeave,
        offLeave,
      };
    }

    const HISTORY_KEY = '__history';

    function createHistory(baseHistory) {
      setContext(HISTORY_KEY, baseHistory);
      return baseHistory;
    }

    function getHistory() {
      return getContext(HISTORY_KEY);
    }

    function createBrowserHistory$1() {
      return createHistory(createBrowserHistory());
    }

    /**
     * Expose `pathToRegexp`.
     */
    var pathToRegexp_1 = pathToRegexp;
    var parse_1 = parse;
    var compile_1 = compile;
    var tokensToFunction_1 = tokensToFunction;
    var tokensToRegExp_1 = tokensToRegExp;

    /**
     * Default configs.
     */
    var DEFAULT_DELIMITER = '/';

    /**
     * The main path matching regexp utility.
     *
     * @type {RegExp}
     */
    var PATH_REGEXP = new RegExp([
      // Match escaped characters that would otherwise appear in future matches.
      // This allows the user to escape special characters that won't transform.
      '(\\\\.)',
      // Match Express-style parameters and un-named parameters with a prefix
      // and optional suffixes. Matches appear as:
      //
      // ":test(\\d+)?" => ["test", "\d+", undefined, "?"]
      // "(\\d+)"  => [undefined, undefined, "\d+", undefined]
      '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
    ].join('|'), 'g');

    /**
     * Parse a string for the raw tokens.
     *
     * @param  {string}  str
     * @param  {Object=} options
     * @return {!Array}
     */
    function parse (str, options) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = '';
      var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
      var whitelist = (options && options.whitelist) || undefined;
      var pathEscaped = false;
      var res;

      while ((res = PATH_REGEXP.exec(str)) !== null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;

        // Ignore already escaped sequences.
        if (escaped) {
          path += escaped[1];
          pathEscaped = true;
          continue
        }

        var prev = '';
        var name = res[2];
        var capture = res[3];
        var group = res[4];
        var modifier = res[5];

        if (!pathEscaped && path.length) {
          var k = path.length - 1;
          var c = path[k];
          var matches = whitelist ? whitelist.indexOf(c) > -1 : true;

          if (matches) {
            prev = c;
            path = path.slice(0, k);
          }
        }

        // Push the current path onto the tokens.
        if (path) {
          tokens.push(path);
          path = '';
          pathEscaped = false;
        }

        var repeat = modifier === '+' || modifier === '*';
        var optional = modifier === '?' || modifier === '*';
        var pattern = capture || group;
        var delimiter = prev || defaultDelimiter;

        tokens.push({
          name: name || key++,
          prefix: prev,
          delimiter: delimiter,
          optional: optional,
          repeat: repeat,
          pattern: pattern
            ? escapeGroup(pattern)
            : '[^' + escapeString(delimiter === defaultDelimiter ? delimiter : (delimiter + defaultDelimiter)) + ']+?'
        });
      }

      // Push any remaining characters.
      if (path || index < str.length) {
        tokens.push(path + str.substr(index));
      }

      return tokens
    }

    /**
     * Compile a string to a template function for the path.
     *
     * @param  {string}             str
     * @param  {Object=}            options
     * @return {!function(Object=, Object=)}
     */
    function compile (str, options) {
      return tokensToFunction(parse(str, options), options)
    }

    /**
     * Expose a method for transforming tokens into the path function.
     */
    function tokensToFunction (tokens, options) {
      // Compile all the tokens into regexps.
      var matches = new Array(tokens.length);

      // Compile all the patterns before compilation.
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === 'object') {
          matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$', flags(options));
        }
      }

      return function (data, options) {
        var path = '';
        var encode = (options && options.encode) || encodeURIComponent;
        var validate = options ? options.validate !== false : true;

        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i];

          if (typeof token === 'string') {
            path += token;
            continue
          }

          var value = data ? data[token.name] : undefined;
          var segment;

          if (Array.isArray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
            }

            if (value.length === 0) {
              if (token.optional) continue

              throw new TypeError('Expected "' + token.name + '" to not be empty')
            }

            for (var j = 0; j < value.length; j++) {
              segment = encode(value[j], token);

              if (validate && !matches[i].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
              }

              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }

            continue
          }

          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            segment = encode(String(value), token);

            if (validate && !matches[i].test(segment)) {
              throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
            }

            path += token.prefix + segment;
            continue
          }

          if (token.optional) continue

          throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
        }

        return path
      }
    }

    /**
     * Escape a regular expression string.
     *
     * @param  {string} str
     * @return {string}
     */
    function escapeString (str) {
      return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
    }

    /**
     * Escape the capturing group by escaping special characters and meaning.
     *
     * @param  {string} group
     * @return {string}
     */
    function escapeGroup (group) {
      return group.replace(/([=!:$/()])/g, '\\$1')
    }

    /**
     * Get the flags for a regexp from the options.
     *
     * @param  {Object} options
     * @return {string}
     */
    function flags (options) {
      return options && options.sensitive ? '' : 'i'
    }

    /**
     * Pull out keys from a regexp.
     *
     * @param  {!RegExp} path
     * @param  {Array=}  keys
     * @return {!RegExp}
     */
    function regexpToRegexp (path, keys) {
      if (!keys) return path

      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);

      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }

      return path
    }

    /**
     * Transform an array into a regexp.
     *
     * @param  {!Array}  path
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function arrayToRegexp (path, keys, options) {
      var parts = [];

      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }

      return new RegExp('(?:' + parts.join('|') + ')', flags(options))
    }

    /**
     * Create a path regexp from string input.
     *
     * @param  {string}  path
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function stringToRegexp (path, keys, options) {
      return tokensToRegExp(parse(path, options), keys, options)
    }

    /**
     * Expose a function for taking tokens and returning a RegExp.
     *
     * @param  {!Array}  tokens
     * @param  {Array=}  keys
     * @param  {Object=} options
     * @return {!RegExp}
     */
    function tokensToRegExp (tokens, keys, options) {
      options = options || {};

      var strict = options.strict;
      var start = options.start !== false;
      var end = options.end !== false;
      var delimiter = options.delimiter || DEFAULT_DELIMITER;
      var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
      var route = start ? '^' : '';

      // Iterate over the tokens and create our regexp string.
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];

        if (typeof token === 'string') {
          route += escapeString(token);
        } else {
          var capture = token.repeat
            ? '(?:' + token.pattern + ')(?:' + escapeString(token.delimiter) + '(?:' + token.pattern + '))*'
            : token.pattern;

          if (keys) keys.push(token);

          if (token.optional) {
            if (!token.prefix) {
              route += '(' + capture + ')?';
            } else {
              route += '(?:' + escapeString(token.prefix) + '(' + capture + '))?';
            }
          } else {
            route += escapeString(token.prefix) + '(' + capture + ')';
          }
        }
      }

      if (end) {
        if (!strict) route += '(?:' + escapeString(delimiter) + ')?';

        route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
      } else {
        var endToken = tokens[tokens.length - 1];
        var isEndDelimited = typeof endToken === 'string'
          ? endToken[endToken.length - 1] === delimiter
          : endToken === undefined;

        if (!strict) route += '(?:' + escapeString(delimiter) + '(?=' + endsWith + '))?';
        if (!isEndDelimited) route += '(?=' + escapeString(delimiter) + '|' + endsWith + ')';
      }

      return new RegExp(route, flags(options))
    }

    /**
     * Normalize the given path string, returning a regular expression.
     *
     * An empty array can be passed in for the keys, which will hold the
     * placeholder key descriptions. For example, using `/user/:id`, `keys` will
     * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
     *
     * @param  {(string|RegExp|Array)} path
     * @param  {Array=}                keys
     * @param  {Object=}               options
     * @return {!RegExp}
     */
    function pathToRegexp (path, keys, options) {
      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys)
      }

      if (Array.isArray(path)) {
        return arrayToRegexp(/** @type {!Array} */ (path), keys, options)
      }

      return stringToRegexp(/** @type {string} */ (path), keys, options)
    }
    pathToRegexp_1.parse = parse_1;
    pathToRegexp_1.compile = compile_1;
    pathToRegexp_1.tokensToFunction = tokensToFunction_1;
    pathToRegexp_1.tokensToRegExp = tokensToRegExp_1;

    const patternCache = {};
    const cacheLimit = 10000;
    let cacheCount = 0;

    function compilePath(pattern, options) {
      const cacheKey = `${options.end}${options.strict}${options.sensitive}`;
      const cache = patternCache[cacheKey] || (patternCache[cacheKey] = {});

      if (cache[pattern]) {
        return cache[pattern];
      }

      const keys = [];
      const re = pathToRegexp_1(pattern, keys, options);
      const compiledPattern = { re, keys };

      if (cacheCount < cacheLimit) {
        cache[pattern] = compiledPattern;
        cacheCount++;
      }

      return compiledPattern;
    }

    function matchPath(pathname, options = {}) {
      if (typeof options === 'string') {
        options = { path: options };
      }

      if (options.path === '*') {
        return true;
      }

      pathname = pathname.split('#')[0];

      const {
        path = '/',
        exact = false,
        strict = false,
        sensitive = false,
      } = options;
      const { re, keys } = compilePath(path, { end: exact, strict, sensitive });
      const match = re.exec(pathname);

      if (!match) {
        return null;
      }

      const [url, ...values] = match;
      const isExact = pathname === url;

      if (exact && !isExact) {
        return null;
      }

      return {
        path,
        url: path === '/' && url === '' ? '/' : url,
        isExact,
        params: keys.reduce((memo, key, index) => {
          memo[key.name] = values[index];
          return memo;
        }, {}),
      };
    }

    const CONTEXT_KEY$1 = '_base_path';

    function createBasePath(basePath) {
      setContext(CONTEXT_KEY$1, basePath);
    }

    function getBasePath() {
      return (getContext(CONTEXT_KEY$1) || '').replace(/\/$/, '');
    }

    const identity = _ => _;

    const CONTEXT_ROUTER_KEY = '__router';
    const CONTEXT_DEPTH_KEY = '__router_depth';
    const CONTEXT_RENDER_UNLOCKED = '__render_unlocked';

    function createRouter(basePath = '/') {
      let routes = [];

      createBasePath(basePath);
      setContext(CONTEXT_DEPTH_KEY, 0);
      setContext(CONTEXT_ROUTER_KEY, {
        getRoutes: () => routes,
        add(route) {
          routes = [...routes, route];
        },
        remove(route) {
          routes = routes.filter(({ path }) => path !== route.path);
        },
      });
      setContext(CONTEXT_RENDER_UNLOCKED, readable(true));
    }

    function getDepth() {
      const currentDepth = getContext(CONTEXT_DEPTH_KEY) + 1;
      setContext(CONTEXT_DEPTH_KEY, currentDepth);
      return currentDepth;
    }

    function createRoute({ path, exact, depth }) {
      const isProtected = getProtected();
      const isRenderUnlocked = getContext(CONTEXT_RENDER_UNLOCKED);
      const context = getContext(CONTEXT_ROUTER_KEY);
      const { currentPath } = getHistory();

      const subject = derived(
        [isProtected, currentPath],
        ([$isProtected, $currentPath]) =>
          $isProtected && matchPath($currentPath, { path, exact }),
      );

      const routeData = { path, exact, isProtected, depth, subject };

      context.add(routeData);
      onDestroy(() => context.remove(routeData));

      return [subject, isRenderUnlocked];
    }

    function createRedirect({ from, to, exact, depth }) {
      const isProtected = getProtected();
      const context = getContext(CONTEXT_ROUTER_KEY);
      const { push, replace, currentPath } = getHistory();

      const unsubscribe = derived([isProtected, currentPath], identity).subscribe(
        async ([$isProtected, $currentPath]) => {
          await tick();
          const routes = context.getRoutes();
          const isFromMatch = matchPath($currentPath, { path: from, exact });
          const isSomeMatch = routes.some(route => {
            return (
              get_store_value(route.isProtected) &&
              matchPath($currentPath, route) &&
              route.depth === depth
            );
          });

          if ($isProtected && !isSomeMatch && isFromMatch) {
            (from !== '*' ? replace : push)(to);
          }
        },
      );

      onDestroy(unsubscribe);
    }

    function fragment(node) {
      node.parentElement.appendChild(node.content);
      node.setAttribute('style', 'display: none;');

      return {
        destroy() {
          if (node && node.parentElement) {
            node.parentElement.removeChild(node.content);
          }
        },
      };
    }

    /* node_modules\swheel\src\Router\BaseRouter.svelte generated by Svelte v3.12.1 */

    const file = "node_modules\\swheel\\src\\Router\\BaseRouter.svelte";

    function create_fragment(ctx) {
    	var object, links_action, current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			object = element("object");

    			if (default_slot) default_slot.c();

    			attr_dev(object, "aria-label", "__links_" + ctx.mId);
    			add_location(object, file, 29, 0, 616);
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(object_nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, object, anchor);

    			if (default_slot) {
    				default_slot.m(object, null);
    			}

    			links_action = links.call(null, object, { history: ctx.history }) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}

    			if (typeof links_action.update === 'function' && changed.history) {
    				links_action.update.call(null, { history: ctx.history });
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(object);
    			}

    			if (default_slot) default_slot.d(detaching);
    			if (links_action && typeof links_action.destroy === 'function') links_action.destroy();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    let id = 0;
    const cachedHistory = new Map();

    function instance($$self, $$props, $$invalidate) {
    	

      let { history } = $$props;

      createRouter();
      createProtection();

      const mId = id++;
      cachedHistory.set(mId, history);

      onDestroy(() => {
        cachedHistory.delete(mId);
      });

    	const writable_props = ['history'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<BaseRouter> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('history' in $$props) $$invalidate('history', history = $$props.history);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { id, history };
    	};

    	$$self.$inject_state = $$props => {
    		if ('history' in $$props) $$invalidate('history', history = $$props.history);
    	};

    	return { history, mId, $$slots, $$scope };
    }

    class BaseRouter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["history"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "BaseRouter", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.history === undefined && !('history' in props)) {
    			console.warn("<BaseRouter> was created without expected prop 'history'");
    		}
    	}

    	get history() {
    		throw new Error("<BaseRouter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set history(value) {
    		throw new Error("<BaseRouter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\swheel\src\Router\BrowserRouter.svelte generated by Svelte v3.12.1 */

    // (7:0) <BaseRouter {history}>
    function create_default_slot(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(7:0) <BaseRouter {history}>", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var current;

    	var baserouter = new BaseRouter({
    		props: {
    		history: ctx.history,
    		$$slots: { default: [create_default_slot] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			baserouter.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(baserouter, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var baserouter_changes = {};
    			if (changed.$$scope) baserouter_changes.$$scope = { changed, ctx };
    			baserouter.$set(baserouter_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(baserouter.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(baserouter.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(baserouter, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	
      const history = createBrowserHistory$1();

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return { history, $$slots, $$scope };
    }

    class BrowserRouter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "BrowserRouter", options, id: create_fragment$1.name });
    	}
    }

    const cache = new Map();

    function createThrottling(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function getPromiseFromCache(component, throttle) {
      if (!cache.has(component)) {
        const promise = Promise.all([component(), createThrottling(throttle)]).then(
          ([loadedComponent]) => loadedComponent,
        );

        cache.set(component, promise);
      }

      return cache.get(component);
    }

    /* node_modules\swheel\src\Router\Lazy.svelte generated by Svelte v3.12.1 */

    const get_catch_slot_changes = () => ({});
    const get_catch_slot_context = () => ({});

    const get_pending_slot_changes = () => ({});
    const get_pending_slot_context = () => ({});

    // (15:0) {:catch}
    function create_catch_block(ctx) {
    	var current;

    	const catch_slot_template = ctx.$$slots.catch;
    	const catch_slot = create_slot(catch_slot_template, ctx, get_catch_slot_context);

    	const block = {
    		c: function create() {
    			if (catch_slot) catch_slot.c();
    		},

    		l: function claim(nodes) {
    			if (catch_slot) catch_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (catch_slot) {
    				catch_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (catch_slot && catch_slot.p && changed.$$scope) {
    				catch_slot.p(
    					get_slot_changes(catch_slot_template, ctx, changed, get_catch_slot_changes),
    					get_slot_context(catch_slot_template, ctx, get_catch_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(catch_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(catch_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (catch_slot) catch_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_catch_block.name, type: "catch", source: "(15:0) {:catch}", ctx });
    	return block;
    }

    // (13:0) {:then loadedComponent}
    function create_then_block(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		ctx.data
    	];

    	var switch_value = ctx.loadedComponent.default;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.data) ? get_spread_update(switch_instance_spread_levels, [
    									get_spread_object(ctx.data)
    								]) : {};

    			if (switch_value !== (switch_value = ctx.loadedComponent.default)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_then_block.name, type: "then", source: "(13:0) {:then loadedComponent}", ctx });
    	return block;
    }

    // (11:16)    <slot name="pending" /> {:then loadedComponent}
    function create_pending_block(ctx) {
    	var current;

    	const pending_slot_template = ctx.$$slots.pending;
    	const pending_slot = create_slot(pending_slot_template, ctx, get_pending_slot_context);

    	const block = {
    		c: function create() {
    			if (pending_slot) pending_slot.c();
    		},

    		l: function claim(nodes) {
    			if (pending_slot) pending_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (pending_slot) {
    				pending_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (pending_slot && pending_slot.p && changed.$$scope) {
    				pending_slot.p(
    					get_slot_changes(pending_slot_template, ctx, changed, get_pending_slot_changes),
    					get_slot_context(pending_slot_template, ctx, get_pending_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(pending_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(pending_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (pending_slot) pending_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_pending_block.name, type: "pending", source: "(11:16)    <slot name=\"pending\" /> {:then loadedComponent}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var await_block_anchor, promise_1, current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 'loadedComponent',
    		error: 'null',
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = ctx.promise, info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();

    			info.block.c();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);

    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;

    			current = true;
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (('promise' in changed) && promise_1 !== (promise_1 = ctx.promise) && handle_promise(promise_1, info)) ; else {
    				info.block.p(changed, assign(assign({}, ctx), info.resolved));
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},

    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(await_block_anchor);
    			}

    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { component, throttle, data = {} } = $$props;

    	const writable_props = ['component', 'throttle', 'data'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Lazy> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('throttle' in $$props) $$invalidate('throttle', throttle = $$props.throttle);
    		if ('data' in $$props) $$invalidate('data', data = $$props.data);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { component, throttle, data, promise };
    	};

    	$$self.$inject_state = $$props => {
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('throttle' in $$props) $$invalidate('throttle', throttle = $$props.throttle);
    		if ('data' in $$props) $$invalidate('data', data = $$props.data);
    		if ('promise' in $$props) $$invalidate('promise', promise = $$props.promise);
    	};

    	let promise;

    	$$self.$$.update = ($$dirty = { component: 1, throttle: 1 }) => {
    		if ($$dirty.component || $$dirty.throttle) { $$invalidate('promise', promise = getPromiseFromCache(component, throttle)); }
    	};

    	return {
    		component,
    		throttle,
    		data,
    		promise,
    		$$slots,
    		$$scope
    	};
    }

    class Lazy extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["component", "throttle", "data"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Lazy", options, id: create_fragment$2.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.component === undefined && !('component' in props)) {
    			console.warn("<Lazy> was created without expected prop 'component'");
    		}
    		if (ctx.throttle === undefined && !('throttle' in props)) {
    			console.warn("<Lazy> was created without expected prop 'throttle'");
    		}
    	}

    	get component() {
    		throw new Error("<Lazy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Lazy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get throttle() {
    		throw new Error("<Lazy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set throttle(value) {
    		throw new Error("<Lazy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get data() {
    		throw new Error("<Lazy>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set data(value) {
    		throw new Error("<Lazy>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\swheel\src\Router\Route.svelte generated by Svelte v3.12.1 */

    const file$1 = "node_modules\\swheel\\src\\Router\\Route.svelte";

    const get_default_slot_changes = ({ $match }) => ({ params: $match });
    const get_default_slot_context = ({ $match }) => ({ params: $match.params });

    const get_catch_slot_changes$1 = ({ $match }) => ({ params: $match });
    const get_catch_slot_context$1 = ({ $match }) => ({ params: $match.params });

    const get_pending_slot_changes$1 = ({ $match }) => ({ params: $match });
    const get_pending_slot_context$1 = ({ $match }) => ({ params: $match.params });

    // (27:0) {#if $match && when && $isRenderUnlocked}
    function create_if_block(ctx) {
    	var current_block_type_index, if_block, if_block_anchor, current;

    	var if_block_creators = [
    		create_if_block_1,
    		create_if_block_2,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (typeof ctx.lazy === 'function') return 0;
    		if (!!ctx.component) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(changed, ctx);
    			} else {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(27:0) {#if $match && when && $isRenderUnlocked}", ctx });
    	return block;
    }

    // (39:2) {:else}
    function create_else_block(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && (changed.$$scope || changed.$match)) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes),
    					get_slot_context(default_slot_template, ctx, get_default_slot_context)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(39:2) {:else}", ctx });
    	return block;
    }

    // (37:24) 
    function create_if_block_2(ctx) {
    	var switch_instance_anchor, current;

    	var switch_instance_spread_levels = [
    		ctx.$match.params
    	];

    	var switch_value = ctx.component;

    	function switch_props(ctx) {
    		let switch_instance_props = {};
    		for (var i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}
    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props());
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) switch_instance.$$.fragment.c();
    			switch_instance_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var switch_instance_changes = (changed.$match) ? get_spread_update(switch_instance_spread_levels, [
    									get_spread_object(ctx.$match.params)
    								]) : {};

    			if (switch_value !== (switch_value = ctx.component)) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;
    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});
    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());

    					switch_instance.$$.fragment.c();
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			}

    			else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(switch_instance_anchor);
    			}

    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(37:24) ", ctx });
    	return block;
    }

    // (28:2) {#if typeof lazy === 'function'}
    function create_if_block_1(ctx) {
    	var current;

    	var lazy_1 = new Lazy({
    		props: {
    		component: ctx.lazy,
    		throttle: ctx.throttle,
    		data: ctx.$match.params,
    		$$slots: {
    		default: [create_default_slot$1],
    		catch: [create_catch_slot],
    		pending: [create_pending_slot]
    	},
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			lazy_1.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(lazy_1, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var lazy_1_changes = {};
    			if (changed.lazy) lazy_1_changes.component = ctx.lazy;
    			if (changed.throttle) lazy_1_changes.throttle = ctx.throttle;
    			if (changed.$match) lazy_1_changes.data = ctx.$match.params;
    			if (changed.$$scope || changed.$match) lazy_1_changes.$$scope = { changed, ctx };
    			lazy_1.$set(lazy_1_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(lazy_1.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(lazy_1.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(lazy_1, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(28:2) {#if typeof lazy === 'function'}", ctx });
    	return block;
    }

    // (30:6) <template use:fragment slot="pending">
    function create_pending_slot(ctx) {
    	var template, fragment_action, current;

    	const pending_slot_template = ctx.$$slots.pending;
    	const pending_slot = create_slot(pending_slot_template, ctx, get_pending_slot_context$1);

    	const block = {
    		c: function create() {
    			template = element("template");

    			if (pending_slot) pending_slot.c();

    			attr_dev(template, "slot", "pending");
    			add_location(template, file$1, 29, 6, 796);
    		},

    		l: function claim(nodes) {
    			if (pending_slot) pending_slot.l(template_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, template, anchor);

    			if (pending_slot) {
    				pending_slot.m(template.content, null);
    			}

    			fragment_action = fragment.call(null, template) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (pending_slot && pending_slot.p && (changed.$$scope || changed.$match)) {
    				pending_slot.p(
    					get_slot_changes(pending_slot_template, ctx, changed, get_pending_slot_changes$1),
    					get_slot_context(pending_slot_template, ctx, get_pending_slot_context$1)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(pending_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(pending_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(template);
    			}

    			if (pending_slot) pending_slot.d(detaching);
    			if (fragment_action && typeof fragment_action.destroy === 'function') fragment_action.destroy();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_pending_slot.name, type: "slot", source: "(30:6) <template use:fragment slot=\"pending\">", ctx });
    	return block;
    }

    // (33:6) <template use:fragment slot="catch">
    function create_catch_slot(ctx) {
    	var template, fragment_action, current;

    	const catch_slot_template = ctx.$$slots.catch;
    	const catch_slot = create_slot(catch_slot_template, ctx, get_catch_slot_context$1);

    	const block = {
    		c: function create() {
    			template = element("template");

    			if (catch_slot) catch_slot.c();

    			attr_dev(template, "slot", "catch");
    			add_location(template, file$1, 32, 6, 891);
    		},

    		l: function claim(nodes) {
    			if (catch_slot) catch_slot.l(template_nodes);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, template, anchor);

    			if (catch_slot) {
    				catch_slot.m(template.content, null);
    			}

    			fragment_action = fragment.call(null, template) || {};
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (catch_slot && catch_slot.p && (changed.$$scope || changed.$match)) {
    				catch_slot.p(
    					get_slot_changes(catch_slot_template, ctx, changed, get_catch_slot_changes$1),
    					get_slot_context(catch_slot_template, ctx, get_catch_slot_context$1)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(catch_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(catch_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(template);
    			}

    			if (catch_slot) catch_slot.d(detaching);
    			if (fragment_action && typeof fragment_action.destroy === 'function') fragment_action.destroy();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_catch_slot.name, type: "slot", source: "(33:6) <template use:fragment slot=\"catch\">", ctx });
    	return block;
    }

    // (29:4) <Lazy component={lazy} {throttle} data={$match.params}>
    function create_default_slot$1(ctx) {
    	var t;

    	const block = {
    		c: function create() {
    			t = space();
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(t);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$1.name, type: "slot", source: "(29:4) <Lazy component={lazy} {throttle} data={$match.params}>", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var if_block_anchor, current;

    	var if_block = (ctx.$match && ctx.when && ctx.$isRenderUnlocked) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (ctx.$match && ctx.when && ctx.$isRenderUnlocked) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $match, $isRenderUnlocked;

    	

      let { path, lazy = null, component = null, throttle = 0, exact = false, when = true } = $$props;

      const depth = getDepth();
      const routePath = getBasePath() + path;

      createBasePath(routePath);

      const [match, isRenderUnlocked] = createRoute({
        path: routePath,
        exact,
        depth,
      }); validate_store(match, 'match'); component_subscribe($$self, match, $$value => { $match = $$value; $$invalidate('$match', $match); }); validate_store(isRenderUnlocked, 'isRenderUnlocked'); component_subscribe($$self, isRenderUnlocked, $$value => { $isRenderUnlocked = $$value; $$invalidate('$isRenderUnlocked', $isRenderUnlocked); });

    	const writable_props = ['path', 'lazy', 'component', 'throttle', 'exact', 'when'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('lazy' in $$props) $$invalidate('lazy', lazy = $$props.lazy);
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('throttle' in $$props) $$invalidate('throttle', throttle = $$props.throttle);
    		if ('exact' in $$props) $$invalidate('exact', exact = $$props.exact);
    		if ('when' in $$props) $$invalidate('when', when = $$props.when);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { path, lazy, component, throttle, exact, when, $match, $isRenderUnlocked };
    	};

    	$$self.$inject_state = $$props => {
    		if ('path' in $$props) $$invalidate('path', path = $$props.path);
    		if ('lazy' in $$props) $$invalidate('lazy', lazy = $$props.lazy);
    		if ('component' in $$props) $$invalidate('component', component = $$props.component);
    		if ('throttle' in $$props) $$invalidate('throttle', throttle = $$props.throttle);
    		if ('exact' in $$props) $$invalidate('exact', exact = $$props.exact);
    		if ('when' in $$props) $$invalidate('when', when = $$props.when);
    		if ('$match' in $$props) match.set($match);
    		if ('$isRenderUnlocked' in $$props) isRenderUnlocked.set($isRenderUnlocked);
    	};

    	return {
    		path,
    		lazy,
    		component,
    		throttle,
    		exact,
    		when,
    		match,
    		isRenderUnlocked,
    		$match,
    		$isRenderUnlocked,
    		$$slots,
    		$$scope
    	};
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["path", "lazy", "component", "throttle", "exact", "when"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Route", options, id: create_fragment$3.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.path === undefined && !('path' in props)) {
    			console.warn("<Route> was created without expected prop 'path'");
    		}
    	}

    	get path() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set path(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get lazy() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set lazy(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get component() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set component(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get throttle() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set throttle(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get exact() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get when() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set when(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\swheel\src\Router\Redirect.svelte generated by Svelte v3.12.1 */

    function create_fragment$4(ctx) {
    	const block = {
    		c: noop,

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

      let { exact = false, from = '*', to } = $$props;

      const basePath = getBasePath();
      const depth = getDepth();

      if (basePath && from === '*') {
        $$invalidate('from', from = basePath);
      } else if (from === '*') {
        $$invalidate('from', from = '*');
      }

      createRedirect({
        from,
        to: getBasePath() + to,
        exact,
        depth,
      });

    	const writable_props = ['exact', 'from', 'to'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Redirect> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('exact' in $$props) $$invalidate('exact', exact = $$props.exact);
    		if ('from' in $$props) $$invalidate('from', from = $$props.from);
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    	};

    	$$self.$capture_state = () => {
    		return { exact, from, to };
    	};

    	$$self.$inject_state = $$props => {
    		if ('exact' in $$props) $$invalidate('exact', exact = $$props.exact);
    		if ('from' in $$props) $$invalidate('from', from = $$props.from);
    		if ('to' in $$props) $$invalidate('to', to = $$props.to);
    	};

    	return { exact, from, to };
    }

    class Redirect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["exact", "from", "to"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Redirect", options, id: create_fragment$4.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.to === undefined && !('to' in props)) {
    			console.warn("<Redirect> was created without expected prop 'to'");
    		}
    	}

    	get exact() {
    		throw new Error("<Redirect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set exact(value) {
    		throw new Error("<Redirect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get from() {
    		throw new Error("<Redirect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set from(value) {
    		throw new Error("<Redirect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get to() {
    		throw new Error("<Redirect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set to(value) {
    		throw new Error("<Redirect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\swheel\src\Router\Protected.svelte generated by Svelte v3.12.1 */

    function create_fragment$5(ctx) {
    	var current;

    	const default_slot_template = ctx.$$slots.default;
    	const default_slot = create_slot(default_slot_template, ctx, null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},

    		l: function claim(nodes) {
    			if (default_slot) default_slot.l(nodes);
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (default_slot && default_slot.p && changed.$$scope) {
    				default_slot.p(
    					get_slot_changes(default_slot_template, ctx, changed, null),
    					get_slot_context(default_slot_template, ctx, null)
    				);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $isProtected;

    	
      let { when } = $$props;

      const isProtected = createLocalProtection(when); validate_store(isProtected, 'isProtected'); component_subscribe($$self, isProtected, $$value => { $isProtected = $$value; $$invalidate('$isProtected', $isProtected); });

      afterUpdate(() => {
        set_store_value(isProtected, $isProtected = when);
      });

    	const writable_props = ['when'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Protected> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;

    	$$self.$set = $$props => {
    		if ('when' in $$props) $$invalidate('when', when = $$props.when);
    		if ('$$scope' in $$props) $$invalidate('$$scope', $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => {
    		return { when, $isProtected };
    	};

    	$$self.$inject_state = $$props => {
    		if ('when' in $$props) $$invalidate('when', when = $$props.when);
    		if ('$isProtected' in $$props) isProtected.set($isProtected);
    	};

    	return { when, isProtected, $$slots, $$scope };
    }

    class Protected extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["when"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Protected", options, id: create_fragment$5.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.when === undefined && !('when' in props)) {
    			console.warn("<Protected> was created without expected prop 'when'");
    		}
    	}

    	get when() {
    		throw new Error("<Protected>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set when(value) {
    		throw new Error("<Protected>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const film = writable({});

    const isFetching = writable(false);
    const error = writable('');

    const url = 'http://www.omdbapi.com/?apikey=c411534d&'; // to generate a key please use http://www.omdbapi.com/

    async function getFilm(searchTerm) {
      isFetching.set(true);
      try {
        let response = await fetch(`${url}&t=${searchTerm}`, {
          method: 'GET',
        });
        let result = await response.json();

        if (response.status === 200 && !result.Error) {
          film.set(result);
        } else {
          error.set(result.Error);
        }

        isFetching.set(false);
      } catch (e) {
        isFetching.set(false);
        error.set(e.message);
      }
    }

    /* src\screens\Home.svelte generated by Svelte v3.12.1 */

    const file$2 = "src\\screens\\Home.svelte";

    // (92:2) {#if $film.Title}
    function create_if_block$1(ctx) {
    	var article, header, img, img_src_value, img_alt_value, t0, h2, t1_value = ctx.$film.Title + "", t1, t2, p, t3_value = ctx.$film.Plot + "", t3, t4, table, tbody, t5, t6;

    	var if_block0 = (ctx.$film.Actors) && create_if_block_3(ctx);

    	var if_block1 = (ctx.$film.Production) && create_if_block_2$1(ctx);

    	var if_block2 = (ctx.$film.Released) && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			article = element("article");
    			header = element("header");
    			img = element("img");
    			t0 = space();
    			h2 = element("h2");
    			t1 = text(t1_value);
    			t2 = space();
    			p = element("p");
    			t3 = text(t3_value);
    			t4 = space();
    			table = element("table");
    			tbody = element("tbody");
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(img, "class", "img svelte-x6jvtk");
    			attr_dev(img, "src", img_src_value = ctx.$film.Poster);
    			attr_dev(img, "alt", img_alt_value = ctx.$film.Title);
    			attr_dev(img, "height", "80");
    			attr_dev(img, "width", "80");
    			add_location(img, file$2, 94, 8, 1908);
    			attr_dev(h2, "class", "title svelte-x6jvtk");
    			add_location(h2, file$2, 100, 8, 2046);
    			attr_dev(header, "class", "header svelte-x6jvtk");
    			add_location(header, file$2, 93, 6, 1876);
    			add_location(p, file$2, 102, 6, 2105);
    			add_location(tbody, file$2, 104, 8, 2161);
    			attr_dev(table, "class", "table svelte-x6jvtk");
    			add_location(table, file$2, 103, 6, 2131);
    			attr_dev(article, "class", "film svelte-x6jvtk");
    			add_location(article, file$2, 92, 4, 1847);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, header);
    			append_dev(header, img);
    			append_dev(header, t0);
    			append_dev(header, h2);
    			append_dev(h2, t1);
    			append_dev(article, t2);
    			append_dev(article, p);
    			append_dev(p, t3);
    			append_dev(article, t4);
    			append_dev(article, table);
    			append_dev(table, tbody);
    			if (if_block0) if_block0.m(tbody, null);
    			append_dev(tbody, t5);
    			if (if_block1) if_block1.m(tbody, null);
    			append_dev(tbody, t6);
    			if (if_block2) if_block2.m(tbody, null);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$film) && img_src_value !== (img_src_value = ctx.$film.Poster)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((changed.$film) && img_alt_value !== (img_alt_value = ctx.$film.Title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((changed.$film) && t1_value !== (t1_value = ctx.$film.Title + "")) {
    				set_data_dev(t1, t1_value);
    			}

    			if ((changed.$film) && t3_value !== (t3_value = ctx.$film.Plot + "")) {
    				set_data_dev(t3, t3_value);
    			}

    			if (ctx.$film.Actors) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_3(ctx);
    					if_block0.c();
    					if_block0.m(tbody, t5);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.$film.Production) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(tbody, t6);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (ctx.$film.Released) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					if_block2.m(tbody, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(article);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(92:2) {#if $film.Title}", ctx });
    	return block;
    }

    // (106:10) {#if $film.Actors}
    function create_if_block_3(ctx) {
    	var tr, th, t1, td, t2_value = ctx.$film.Actors + "", t2;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			th.textContent = "Starring:";
    			t1 = space();
    			td = element("td");
    			t2 = text(t2_value);
    			attr_dev(th, "class", "th svelte-x6jvtk");
    			add_location(th, file$2, 107, 14, 2229);
    			add_location(td, file$2, 108, 14, 2273);
    			add_location(tr, file$2, 106, 12, 2210);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(tr, t1);
    			append_dev(tr, td);
    			append_dev(td, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$film) && t2_value !== (t2_value = ctx.$film.Actors + "")) {
    				set_data_dev(t2, t2_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(106:10) {#if $film.Actors}", ctx });
    	return block;
    }

    // (112:10) {#if $film.Production}
    function create_if_block_2$1(ctx) {
    	var tr, th, t1, td, t2_value = ctx.$film.Production + "", t2;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			th.textContent = "Production company:";
    			t1 = space();
    			td = element("td");
    			t2 = text(t2_value);
    			attr_dev(th, "class", "th svelte-x6jvtk");
    			add_location(th, file$2, 113, 14, 2395);
    			add_location(td, file$2, 114, 14, 2449);
    			add_location(tr, file$2, 112, 12, 2376);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(tr, t1);
    			append_dev(tr, td);
    			append_dev(td, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$film) && t2_value !== (t2_value = ctx.$film.Production + "")) {
    				set_data_dev(t2, t2_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2$1.name, type: "if", source: "(112:10) {#if $film.Production}", ctx });
    	return block;
    }

    // (118:10) {#if $film.Released}
    function create_if_block_1$1(ctx) {
    	var tr, th, t1, td, t2_value = ctx.$film.Released + "", t2;

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			th = element("th");
    			th.textContent = "Release date:";
    			t1 = space();
    			td = element("td");
    			t2 = text(t2_value);
    			attr_dev(th, "class", "th svelte-x6jvtk");
    			add_location(th, file$2, 119, 14, 2573);
    			add_location(td, file$2, 120, 14, 2621);
    			add_location(tr, file$2, 118, 12, 2554);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, th);
    			append_dev(tr, t1);
    			append_dev(tr, td);
    			append_dev(td, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$film) && t2_value !== (t2_value = ctx.$film.Released + "")) {
    				set_data_dev(t2, t2_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(tr);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(118:10) {#if $film.Released}", ctx });
    	return block;
    }

    function create_fragment$6(ctx) {
    	var div, form, label, t1, input0, t2, input1, t3, dispose;

    	var if_block = (ctx.$film.Title) && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			label = element("label");
    			label.textContent = "Please, type a name of the film";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(label, "for", "filmName");
    			attr_dev(label, "class", "label svelte-x6jvtk");
    			add_location(label, file$2, 85, 4, 1605);
    			attr_dev(input0, "id", "filmName");
    			attr_dev(input0, "class", "input svelte-x6jvtk");
    			add_location(input0, file$2, 88, 4, 1697);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Submit";
    			attr_dev(input1, "class", "btn svelte-x6jvtk");
    			add_location(input1, file$2, 89, 4, 1762);
    			attr_dev(form, "class", "form svelte-x6jvtk");
    			add_location(form, file$2, 84, 2, 1541);
    			attr_dev(div, "class", "wrap svelte-x6jvtk");
    			add_location(div, file$2, 83, 0, 1520);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(form, "submit", prevent_default(ctx.handleSubmit), false, true)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			append_dev(form, label);
    			append_dev(form, t1);
    			append_dev(form, input0);

    			set_input_value(input0, ctx._filmName);

    			append_dev(form, t2);
    			append_dev(form, input1);
    			append_dev(div, t3);
    			if (if_block) if_block.m(div, null);
    		},

    		p: function update(changed, ctx) {
    			if (changed._filmName && (input0.value !== ctx._filmName)) set_input_value(input0, ctx._filmName);

    			if (ctx.$film.Title) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			if (if_block) if_block.d();
    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $film;

    	validate_store(film, 'film');
    	component_subscribe($$self, film, $$value => { $film = $$value; $$invalidate('$film', $film); });

    	

      let _filmName = '';

      function handleSubmit() {
        getFilm(_filmName);
        $$invalidate('_filmName', _filmName = '');
      }

    	function input0_input_handler() {
    		_filmName = this.value;
    		$$invalidate('_filmName', _filmName);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('_filmName' in $$props) $$invalidate('_filmName', _filmName = $$props._filmName);
    		if ('$film' in $$props) film.set($film);
    	};

    	return {
    		_filmName,
    		handleSubmit,
    		$film,
    		input0_input_handler
    	};
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Home", options, id: create_fragment$6.name });
    	}
    }

    const username = writable('');

    /* src\screens\Login.svelte generated by Svelte v3.12.1 */

    const file$3 = "src\\screens\\Login.svelte";

    function create_fragment$7(ctx) {
    	var form, div, svg, g, path0, path1, path2, t0, label, t2, input0, t3, input1, dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div = element("div");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t0 = space();
    			label = element("label");
    			label.textContent = "User name";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			input1 = element("input");
    			attr_dev(path0, "d", "M0 0h24v24H0V0z");
    			add_location(path0, file$3, 95, 8, 2286);
    			attr_dev(path1, "d", "M0 0h24v24H0V0z");
    			attr_dev(path1, "opacity", ".87");
    			add_location(path1, file$3, 96, 8, 2323);
    			attr_dev(g, "fill", "none");
    			add_location(g, file$3, 94, 6, 2262);
    			attr_dev(path2, "d", "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2\n        2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9\n        6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9\n        14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2\n        2z");
    			add_location(path2, file$3, 98, 6, 2383);
    			attr_dev(svg, "class", "svg svelte-1eg6awu");
    			attr_dev(svg, "viewBox", "0 0 24 24");
    			attr_dev(svg, "width", "24");
    			attr_dev(svg, "height", "24");
    			add_location(svg, file$3, 93, 4, 2195);
    			attr_dev(div, "class", "icon svelte-1eg6awu");
    			add_location(div, file$3, 92, 2, 2172);
    			attr_dev(label, "for", "username");
    			attr_dev(label, "class", "label svelte-1eg6awu");
    			add_location(label, file$3, 106, 2, 2678);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "id", "username");
    			input0.required = true;
    			attr_dev(input0, "class", "input svelte-1eg6awu");
    			add_location(input0, file$3, 107, 2, 2734);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Sign in";
    			attr_dev(input1, "class", "btn svelte-1eg6awu");
    			add_location(input1, file$3, 113, 2, 2838);
    			attr_dev(form, "class", "form svelte-1eg6awu");
    			add_location(form, file$3, 91, 0, 2110);

    			dispose = [
    				listen_dev(input0, "input", ctx.input0_input_handler),
    				listen_dev(form, "submit", prevent_default(ctx.handleSubmit), false, true)
    			];
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div);
    			append_dev(div, svg);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(svg, path2);
    			append_dev(form, t0);
    			append_dev(form, label);
    			append_dev(form, t2);
    			append_dev(form, input0);

    			set_input_value(input0, ctx._username);

    			append_dev(form, t3);
    			append_dev(form, input1);
    		},

    		p: function update(changed, ctx) {
    			if (changed._username && (input0.value !== ctx._username)) set_input_value(input0, ctx._username);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(form);
    			}

    			run_all(dispose);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let _username = '';

      function handleSubmit() {
        username.set(_username);
      }

    	function input0_input_handler() {
    		_username = this.value;
    		$$invalidate('_username', _username);
    	}

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('_username' in $$props) $$invalidate('_username', _username = $$props._username);
    	};

    	return {
    		_username,
    		handleSubmit,
    		input0_input_handler
    	};
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Login", options, id: create_fragment$7.name });
    	}
    }

    /* src\components\Error.svelte generated by Svelte v3.12.1 */
    const { Error: Error_1 } = globals;

    const file$4 = "src\\components\\Error.svelte";

    function create_fragment$8(ctx) {
    	var button, span, svg0, path0, t0, t1, t2, svg1, path1, dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			span = element("span");
    			svg0 = svg_element("svg");
    			path0 = svg_element("path");
    			t0 = text("\n      ");
    			t1 = text(ctx.$error);
    			t2 = space();
    			svg1 = svg_element("svg");
    			path1 = svg_element("path");
    			attr_dev(path0, "d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52\n        2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z");
    			add_location(path0, file$4, 56, 6, 1160);
    			attr_dev(svg0, "class", "icon svelte-1ol5hbf");
    			attr_dev(svg0, "viewBox", "0 0 24 24");
    			attr_dev(svg0, "width", "20");
    			attr_dev(svg0, "height", "20");
    			add_location(svg0, file$4, 55, 4, 1092);
    			attr_dev(span, "class", "text svelte-1ol5hbf");
    			add_location(span, file$4, 54, 2, 1068);
    			attr_dev(path1, "d", "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41\n      19 12 13.41 17.59 19 19 17.59 13.41 12z");
    			add_location(path1, file$4, 68, 4, 1439);
    			attr_dev(svg1, "class", "icon svelte-1ol5hbf");
    			attr_dev(svg1, "viewBox", "0 0 24 24");
    			attr_dev(svg1, "aria-hidden", "true");
    			attr_dev(svg1, "width", "20");
    			attr_dev(svg1, "height", "20");
    			add_location(svg1, file$4, 62, 2, 1334);
    			attr_dev(button, "class", "wrap svelte-1ol5hbf");
    			toggle_class(button, "error", ctx.$error);
    			add_location(button, file$4, 50, 0, 986);
    			dispose = listen_dev(button, "click", ctx.click_handler);
    		},

    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, span);
    			append_dev(span, svg0);
    			append_dev(svg0, path0);
    			append_dev(span, t0);
    			append_dev(span, t1);
    			append_dev(button, t2);
    			append_dev(button, svg1);
    			append_dev(svg1, path1);
    		},

    		p: function update(changed, ctx) {
    			if (changed.$error) {
    				set_data_dev(t1, ctx.$error);
    				toggle_class(button, "error", ctx.$error);
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(button);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $error;

    	validate_store(error, 'error');
    	component_subscribe($$self, error, $$value => { $error = $$value; $$invalidate('$error', $error); });

    	const click_handler = () => error.set('');

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('$error' in $$props) error.set($error);
    	};

    	return { $error, click_handler };
    }

    class Error$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Error", options, id: create_fragment$8.name });
    	}
    }

    /* src\components\Spinner.svelte generated by Svelte v3.12.1 */

    const file$5 = "src\\components\\Spinner.svelte";

    function create_fragment$9(ctx) {
    	var div, svg, circle;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			circle = svg_element("circle");
    			attr_dev(circle, "class", "circle svelte-kigxxk");
    			attr_dev(circle, "cx", "44");
    			attr_dev(circle, "cy", "44");
    			attr_dev(circle, "r", "20.2");
    			attr_dev(circle, "fill", "none");
    			attr_dev(circle, "stroke-width", "3.6");
    			add_location(circle, file$5, 38, 4, 776);
    			attr_dev(svg, "viewBox", "22 22 44 44");
    			attr_dev(svg, "width", "40");
    			attr_dev(svg, "height", "40");
    			add_location(svg, file$5, 37, 2, 721);
    			attr_dev(div, "class", "root svelte-kigxxk");
    			add_location(div, file$5, 36, 0, 700);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, circle);
    		},

    		p: noop,
    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    class Spinner extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$9, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Spinner", options, id: create_fragment$9.name });
    	}
    }

    /* src\routing\App.svelte generated by Svelte v3.12.1 */
    const { Error: Error_1$1 } = globals;

    // (25:4) <Route path="/home">
    function create_default_slot_4(ctx) {
    	var current;

    	var home = new Home({ $$inline: true });

    	const block = {
    		c: function create() {
    			home.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(home, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(home.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(home.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(home, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_4.name, type: "slot", source: "(25:4) <Route path=\"/home\">", ctx });
    	return block;
    }

    // (24:2) <Protected when={$username}>
    function create_default_slot_3(ctx) {
    	var t, current;

    	var route = new Route({
    		props: {
    		path: "/home",
    		$$slots: { default: [create_default_slot_4] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var redirect = new Redirect({ props: { to: "/home" }, $$inline: true });

    	const block = {
    		c: function create() {
    			route.$$.fragment.c();
    			t = space();
    			redirect.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(redirect, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route_changes = {};
    			if (changed.$$scope) route_changes.$$scope = { changed, ctx };
    			route.$set(route_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);

    			transition_in(redirect.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			transition_out(redirect.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(route, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_component(redirect, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3.name, type: "slot", source: "(24:2) <Protected when={$username}>", ctx });
    	return block;
    }

    // (31:4) <Route path="/" exact={true}>
    function create_default_slot_2(ctx) {
    	var current;

    	var login = new Login({ $$inline: true });

    	const block = {
    		c: function create() {
    			login.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(login, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(login.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(login.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(login, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(31:4) <Route path=\"/\" exact={true}>", ctx });
    	return block;
    }

    // (30:2) <Protected when={!$username}>
    function create_default_slot_1(ctx) {
    	var t, current;

    	var route = new Route({
    		props: {
    		path: "/",
    		exact: true,
    		$$slots: { default: [create_default_slot_2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var redirect = new Redirect({ props: { to: "/" }, $$inline: true });

    	const block = {
    		c: function create() {
    			route.$$.fragment.c();
    			t = space();
    			redirect.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(redirect, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var route_changes = {};
    			if (changed.$$scope) route_changes.$$scope = { changed, ctx };
    			route.$set(route_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);

    			transition_in(redirect.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			transition_out(redirect.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(route, detaching);

    			if (detaching) {
    				detach_dev(t);
    			}

    			destroy_component(redirect, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(30:2) <Protected when={!$username}>", ctx });
    	return block;
    }

    // (37:2) {#if $isFetching}
    function create_if_block$2(ctx) {
    	var current;

    	var spinner = new Spinner({ $$inline: true });

    	const block = {
    		c: function create() {
    			spinner.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(spinner, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(spinner.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(spinner.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(spinner, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(37:2) {#if $isFetching}", ctx });
    	return block;
    }

    // (23:0) <Router>
    function create_default_slot$2(ctx) {
    	var t0, t1, t2, if_block_anchor, current;

    	var protected0 = new Protected({
    		props: {
    		when: ctx.$username,
    		$$slots: { default: [create_default_slot_3] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var protected1 = new Protected({
    		props: {
    		when: !ctx.$username,
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	var error = new Error$1({ $$inline: true });

    	var if_block = (ctx.$isFetching) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			protected0.$$.fragment.c();
    			t0 = space();
    			protected1.$$.fragment.c();
    			t1 = space();
    			error.$$.fragment.c();
    			t2 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			mount_component(protected0, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(protected1, target, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(error, target, anchor);
    			insert_dev(target, t2, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var protected0_changes = {};
    			if (changed.$username) protected0_changes.when = ctx.$username;
    			if (changed.$$scope) protected0_changes.$$scope = { changed, ctx };
    			protected0.$set(protected0_changes);

    			var protected1_changes = {};
    			if (changed.$username) protected1_changes.when = !ctx.$username;
    			if (changed.$$scope) protected1_changes.$$scope = { changed, ctx };
    			protected1.$set(protected1_changes);

    			if (ctx.$isFetching) {
    				if (!if_block) {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else transition_in(if_block, 1);
    			} else if (if_block) {
    				group_outros();
    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(protected0.$$.fragment, local);

    			transition_in(protected1.$$.fragment, local);

    			transition_in(error.$$.fragment, local);

    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(protected0.$$.fragment, local);
    			transition_out(protected1.$$.fragment, local);
    			transition_out(error.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(protected0, detaching);

    			if (detaching) {
    				detach_dev(t0);
    			}

    			destroy_component(protected1, detaching);

    			if (detaching) {
    				detach_dev(t1);
    			}

    			destroy_component(error, detaching);

    			if (detaching) {
    				detach_dev(t2);
    			}

    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot$2.name, type: "slot", source: "(23:0) <Router>", ctx });
    	return block;
    }

    function create_fragment$a(ctx) {
    	var current;

    	var router = new BrowserRouter({
    		props: {
    		$$slots: { default: [create_default_slot$2] },
    		$$scope: { ctx }
    	},
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			router.$$.fragment.c();
    		},

    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var router_changes = {};
    			if (changed.$$scope || changed.$isFetching || changed.$username) router_changes.$$scope = { changed, ctx };
    			router.$set(router_changes);
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$a.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $username, $isFetching;

    	validate_store(username, 'username');
    	component_subscribe($$self, username, $$value => { $username = $$value; $$invalidate('$username', $username); });
    	validate_store(isFetching, 'isFetching');
    	component_subscribe($$self, isFetching, $$value => { $isFetching = $$value; $$invalidate('$isFetching', $isFetching); });

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('$username' in $$props) username.set($username);
    		if ('$isFetching' in $$props) isFetching.set($isFetching);
    	};

    	return { $username, $isFetching };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$a, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$a.name });
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: 'world',
      },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
