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

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InfiniteScroll = function (_Component) {
  _inherits(InfiniteScroll, _Component);

  function InfiniteScroll(props) {
    _classCallCheck(this, InfiniteScroll);

    var _this = _possibleConstructorReturn(this, (InfiniteScroll.__proto__ || Object.getPrototypeOf(InfiniteScroll)).call(this, props));

    _this.scrollListener = _this.scrollListener.bind(_this);
    _this.state = {
      items: [],
      visiblePage: null,
      loadTopCount: 0,
      loadBottomCount: 0,
      stopLoadBottom: false,
      stopLoadTop: false
    };
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
      this.isInitialScroll = true;
      this.lastLoadWasBefore = false;
      this.attachScrollListener();
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate() {
      if ((this.isInitialScroll || this.lastLoadWasBefore) && this.pageLoaded !== 1 && this.pageLoaded === this.props.pageStart) {
        window.scrollTo(0, this.props.thresholdTop + 1);
        this.isInitialScroll = false;
        this.lastLoadWasBefore = false;
      }
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
    key: 'reset',
    value: function reset() {
      this.pageLoaded = 0;
      this.minPageLoaded = 1;
      this.props.onPageChange(1);
      this.isInitialScroll = false;
      this.lastLoadWasBefore = false;
      this.setState({
        items: [],
        loadTopCount: 0,
        loadBottomCount: 0,
        stopLoadBottom: false,
        stopLoadTop: false
      });
    }
  }, {
    key: 'getA',
    value: function getA(items, page) {
      var anchorElement1 = _react2.default.createElement('a', { key: page + 'start', href: '#' + page, className: 'page-anchor', 'data-page': page });
      var anchorElement2 = _react2.default.createElement('a', { key: page + 'end', href: '#' + page, className: 'page-anchor', 'data-page': page });
      return [anchorElement1].concat(_toConsumableArray(items), [anchorElement2]);
    }
  }, {
    key: 'scrollOnePage',
    value: function scrollOnePage() {
      if (this.onePageHeight === null) {
        var anchors = document.getElementsByClassName('page-anchor');
        this.onePageHeight = this.calculateTopPosition(anchors[1]) - this.calculateTopPosition(anchors[0]);
      }
      window.scrollTo(0, this.getScrollTop() + this.onePageHeight);
    }
  }, {
    key: 'afterLoadMore',
    value: function afterLoadMore(items, page) {
      var _this2 = this;

      this.setState(function (prevState, props) {
        return {
          items: prevState.items.concat(_this2.getA(items, page)),
          loadBottomCount: prevState.loadBottomCount + 1,
          stopLoadBottom: prevState.loadBottomCount > props.loadPagesBeforeStop - 1 ? true : false
        };
      });
    }
  }, {
    key: 'afterLoadBefore',
    value: function afterLoadBefore(items, page) {
      var _this3 = this;

      this.lastLoadWasBefore = true;
      this.setState(function (prevState, props) {
        return {
          items: _this3.getA(items, page).concat(prevState.items),
          loadTopCount: prevState.loadTopCount + 1,
          stopLoadTop: prevState.loadTopCount > props.loadPagesBeforeStop - 2 ? true : false
        };
      });
      this.scrollOnePage();
    }
  }, {
    key: 'getScrollTop',
    value: function getScrollTop() {
      var scrollTop = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
      return scrollTop;
    }
  }, {
    key: 'enableLoadMoreTop',
    value: function enableLoadMoreTop() {
      this.setState({
        stopLoadTop: false,
        loadTopCount: 0
      });
    }
  }, {
    key: 'enableLoadMoreBottom',
    value: function enableLoadMoreBottom() {
      this.setState({
        stopLoadBottom: false,
        loadBottomCount: 0
      });
    }
  }, {
    key: 'getVisiblePage',
    value: function getVisiblePage() {
      var anchors = document.getElementsByClassName('page-anchor');
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = anchors[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var anchor = _step.value;

          if (this.calculateTopPosition(anchor) > this.getScrollTop()) {
            return parseInt(anchor.getAttribute('data-page'));
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: 'scrollListener',
    value: function scrollListener() {
      var el = this.scrollComponent;
      var scrollEl = window;

      var offset = void 0;
      var offsetTop = void 0;
      if (this.props.useWindow) {
        var scrollTop = this.getScrollTop();
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

      if (offset < Number(this.props.thresholdBottom)) {
        if (this.props.hasMore && !this.state.stopLoadBottom) {
          this.detachScrollListener();
          // Call loadMore after detachScrollListener to allow for non-async loadMore functions
          if (typeof this.props.loadMore === 'function') {
            this.props.loadMore(this.pageLoaded += 1, this.afterLoadMore.bind(this));
          }
        }
      } else if (offsetTop < Number(this.props.thresholdTop) && !this.state.stopLoadTop) {
        if (this.minPageLoaded > 1) {
          this.detachScrollListener();
          // Call loadMore after detachScrollListener to allow for non-async loadMore functions
          if (typeof this.props.loadMore === 'function') {
            this.props.loadMore(this.minPageLoaded -= 1, this.afterLoadBefore.bind(this));
          }
        }
      }

      var visiblePage = this.getVisiblePage();
      if (visiblePage && this.state.visiblePage !== visiblePage) {
        this.setState({ visiblePage: visiblePage }, this.props.onPageChange(visiblePage));
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
      var _this4 = this;

      var _props = this.props,
          element = _props.element,
          hasMore = _props.hasMore,
          initialLoad = _props.initialLoad,
          isReverse = _props.isReverse,
          loader = _props.loader,
          loadStopper = _props.loadStopper,
          loadMore = _props.loadMore,
          loadPagesBeforeStop = _props.loadPagesBeforeStop,
          onPageChange = _props.onPageChange,
          pageStart = _props.pageStart,
          pageSize = _props.pageSize,
          renderPagesCount = _props.renderPagesCount,
          ref = _props.ref,
          thresholdTop = _props.thresholdTop,
          thresholdBottom = _props.thresholdBottom,
          useCapture = _props.useCapture,
          useWindow = _props.useWindow,
          props = _objectWithoutProperties(_props, ['element', 'hasMore', 'initialLoad', 'isReverse', 'loader', 'loadStopper', 'loadMore', 'loadPagesBeforeStop', 'onPageChange', 'pageStart', 'pageSize', 'renderPagesCount', 'ref', 'thresholdTop', 'thresholdBottom', 'useCapture', 'useWindow']);

      props.ref = function (node) {
        _this4.scrollComponent = node;
        if (ref) {
          ref(node);
        }
      };

      var childrenArray = this.state.items.slice(0);

      if (this.props.pageSize) {
        var startRenderIndex = Math.max(0, (this.state.visiblePage - this.minPageLoaded - this.props.renderPagesCount) * (this.props.pageSize + 2));
        var endRenderIndex = Math.max(this.props.pageSize + 2, (this.state.visiblePage - this.minPageLoaded + 1 + this.props.renderPagesCount) * (this.props.pageSize + 2));
        childrenArray = childrenArray.slice(startRenderIndex, endRenderIndex);
      }

      if (this.state.stopLoadTop) {
        childrenArray.unshift(_react2.default.createElement('a', {
          onClick: this.enableLoadMoreTop.bind(this),
          className: 'loader-link top'
        }, this.props.loadStopper));
      }

      if (this.state.stopLoadBottom) {
        childrenArray.push(_react2.default.createElement('a', {
          onClick: this.enableLoadMoreBottom.bind(this),
          className: 'loader-link bottom'
        }, this.props.loadStopper));
      }

      if (hasMore && !this.state.stopLoadBottom) {
        if (loader) {
          isReverse ? childrenArray.unshift(loader) : childrenArray.push(loader);
        } else if (this.defaultLoader) {
          isReverse ? childrenArray.unshift(this.defaultLoader) : childrenArray.push(this.defaultLoader);
        }
      }
      // disable loader
      if (false && this.minPageLoaded > 1 && !this.state.stopLoadTop) {
        if (loader) {
          childrenArray.unshift(loader);
        } else {
          childrenArray.unshift(this.defaultLoader);
        }
      }
      return _react2.default.createElement.apply(_react2.default, [element, props].concat(_toConsumableArray(childrenArray)));
    }
  }]);

  return InfiniteScroll;
}(_react.Component);

InfiniteScroll.propTypes = {
  element: _propTypes2.default.string,
  hasMore: _propTypes2.default.bool,
  initialLoad: _propTypes2.default.bool,
  isReverse: _propTypes2.default.bool,
  loader: _propTypes2.default.object,
  loadStopper: _propTypes2.default.object,
  loadPagesBeforeStop: _propTypes2.default.number,
  loadMore: _propTypes2.default.func.isRequired,
  onPageChange: _propTypes2.default.func.isRequired,
  pageStart: _propTypes2.default.number,
  pageSize: _propTypes2.default.number,
  renderPagesCount: _propTypes2.default.number,
  ref: _propTypes2.default.func,
  thresholdTop: _propTypes2.default.number,
  thresholdBottom: _propTypes2.default.number,
  useCapture: _propTypes2.default.bool,
  useWindow: _propTypes2.default.bool
};
InfiniteScroll.defaultProps = {
  element: 'div',
  hasMore: false,
  initialLoad: true,
  pageStart: 0,
  pageSize: null,
  renderPagesCount: 2,
  ref: null,
  thresholdTop: 250,
  thresholdBottom: 250,
  useWindow: true,
  isReverse: false,
  useCapture: false,
  loader: null,
  loadStopper: 'load more',
  loadPagesBeforeStop: 3
};
exports.default = InfiniteScroll;
module.exports = exports['default'];
