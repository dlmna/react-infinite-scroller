'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InfiniteScroll = function (_Component) {
  _inherits(InfiniteScroll, _Component);

  function InfiniteScroll(props) {
    _classCallCheck(this, InfiniteScroll);

    var _this = _possibleConstructorReturn(this, (InfiniteScroll.__proto__ || Object.getPrototypeOf(InfiniteScroll)).call(this, props));

    _this.scrollListener = _this.scrollListener.bind(_this);
    return _this;
  }

  _createClass(InfiniteScroll, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // page at pageStart is not yet loaded
      this.pageLoaded = this.props.pageStart - 1;
      // first page is loaded automatically, therefore minPageLoaded is the page number after initial pageLoaded (== pageStart)
      this.minPageLoaded = this.props.pageStart;
      this.onePageHeight = null;
      this.visiblePage = null;
      this.attachScrollListener();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      this.attachScrollListener();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.detachScrollListener();
    }

    // Set a defaut loader for all your `InfiniteScroll` components

  }, {
    key: 'setDefaultLoader',
    value: function setDefaultLoader(loader) {
      this.defaultLoader = loader;
    }
  }, {
    key: 'detachScrollListener',
    value: function detachScrollListener() {
      var scrollEl = window;
      if (this.props.useWindow === false) {
        scrollEl = this.scrollComponent.parentNode;
      }

      scrollEl.removeEventListener('scroll', this.scrollListener, this.props.useCapture);
      scrollEl.removeEventListener('resize', this.scrollListener, this.props.useCapture);
    }
  }, {
    key: 'attachScrollListener',
    value: function attachScrollListener() {
      if (!this.props.hasMore && !this.props.hasMoreBefore) {
        return;
      }

      var scrollEl = window;
      if (this.props.useWindow === false) {
        scrollEl = this.scrollComponent.parentNode;
      }

      scrollEl.addEventListener('scroll', this.scrollListener, this.props.useCapture);
      scrollEl.addEventListener('resize', this.scrollListener, this.props.useCapture);

      if (this.props.initialLoad) {
        this.scrollListener();
      }
    }
  }, {
    key: 'afterLoadMore',
    value: function afterLoadMore() {
      if (this.onePageHeight === null && this.pageLoaded === this.props.pageStart) {
        this.onePageHeight = this.scrollComponent.offsetHeight;
      }
    }
  }, {
    key: 'afterLoadBefore',
    value: function afterLoadBefore() {
      if (this.onePageHeight === null && this.pageLoaded === this.props.pageStart) {
        this.onePageHeight = this.scrollComponent.offsetHeight;
      }
      var scrollTop = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      window.scrollTo(0, scrollTop + this.onePageHeight);
    }
  }, {
    key: 'scrollListener',
    value: function scrollListener() {
      var el = this.scrollComponent;
      var scrollEl = window;

      var offset = void 0;
      var offsetTop = void 0;
      if (this.props.useWindow) {
        var scrollTop = scrollEl.pageYOffset !== undefined ? scrollEl.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
        if (this.props.isReverse) {
          offset = scrollTop;
        } else {
          offset = this.calculateTopPosition(el) + (el.offsetHeight - scrollTop - window.innerHeight);
        }
        offsetTop = scrollTop;
      } else if (this.props.isReverse) {
        offset = el.parentNode.scrollTop;
      } else {
        offset = el.scrollHeight - el.parentNode.scrollTop - el.parentNode.clientHeight;
      }

      if (offset < Number(this.props.threshold)) {
        this.detachScrollListener();
        // Call loadMore after detachScrollListener to allow for non-async loadMore functions
        if (typeof this.props.loadMore === 'function') {
          this.props.loadMore(this.pageLoaded += 1, this.afterLoadMore.bind(this));
        }
      } else if (offsetTop < Number(this.props.threshold)) {
        if (this.minPageLoaded > 1) {
          this.detachScrollListener();
          // Call loadBefore after detachScrollListener to allow for non-async loadBefore functions
          if (typeof this.props.loadBefore === 'function') {
            this.props.loadBefore(this.minPageLoaded -= 1, this.afterLoadBefore.bind(this));
          }
        } else {
          this.hasMoreBefore = false;
        }
      }

      if (this.onePageHeight) {
        var visiblePage = (offsetTop - this.calculateTopPosition(el)) / this.onePageHeight;
        visiblePage = Math.round(visiblePage) + this.minPageLoaded;
        console.log('visible page #', visiblePage);
        if (this.visiblePage !== visiblePage) {
          this.visiblePage = visiblePage;
          this.props.onPageChange(this.visiblePage);
        }
      }
    }
  }, {
    key: 'calculateTopPosition',
    value: function calculateTopPosition(el) {
      if (!el) {
        return 0;
      }
      return el.offsetTop + this.calculateTopPosition(el.offsetParent);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          children = _props.children,
          element = _props.element,
          hasMore = _props.hasMore,
          hasMoreBefore = _props.hasMoreBefore,
          initialLoad = _props.initialLoad,
          isReverse = _props.isReverse,
          loader = _props.loader,
          loadMore = _props.loadMore,
          loadBefore = _props.loadBefore,
          onPageChange = _props.onPageChange,
          pageStart = _props.pageStart,
          ref = _props.ref,
          threshold = _props.threshold,
          useCapture = _props.useCapture,
          useWindow = _props.useWindow,
          props = _objectWithoutProperties(_props, ['children', 'element', 'hasMore', 'hasMoreBefore', 'initialLoad', 'isReverse', 'loader', 'loadMore', 'loadBefore', 'onPageChange', 'pageStart', 'ref', 'threshold', 'useCapture', 'useWindow']);

      props.ref = function (node) {
        _this2.scrollComponent = node;
        if (ref) {
          ref(node);
        }
      };

      var childrenArray = [children];
      if (hasMore) {
        if (loader) {
          isReverse ? childrenArray.unshift(loader) : childrenArray.push(loader);
        } else if (this.defaultLoader) {
          isReverse ? childrenArray.unshift(this.defaultLoader) : childrenArray.push(this.defaultLoader);
        }
      }
      if (hasMoreBefore) {
        if (loader) {
          childrenArray.unshift(loader);
        } else {
          childrenArray.unshift(this.defaultLoader);
        }
      }
      return _react2.default.createElement.apply(_react2.default, [element, props].concat(childrenArray));
    }
  }]);

  return InfiniteScroll;
}(_react.Component);

InfiniteScroll.propTypes = {
  children: _propTypes2.default.oneOfType([_propTypes2.default.object, _propTypes2.default.array]).isRequired,
  element: _propTypes2.default.string,
  hasMore: _propTypes2.default.bool,
  hasMoreBefore: _propTypes2.default.bool,
  initialLoad: _propTypes2.default.bool,
  isReverse: _propTypes2.default.bool,
  loader: _propTypes2.default.object,
  loadMore: _propTypes2.default.func.isRequired,
  loadBefore: _propTypes2.default.func.isRequired,
  onPageChange: _propTypes2.default.func.isRequired,
  pageStart: _propTypes2.default.number,
  ref: _propTypes2.default.func,
  threshold: _propTypes2.default.number,
  useCapture: _propTypes2.default.bool,
  useWindow: _propTypes2.default.bool
};
InfiniteScroll.defaultProps = {
  element: 'div',
  hasMore: false,
  hasMoreBefore: false,
  initialLoad: true,
  pageStart: 0,
  ref: null,
  threshold: 250,
  useWindow: true,
  isReverse: false,
  useCapture: false,
  loader: null
};
exports.default = InfiniteScroll;
module.exports = exports['default'];
