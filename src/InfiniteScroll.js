import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export default class InfiniteScroll extends Component {
  static propTypes = {
    element: PropTypes.string,
    hasMore: PropTypes.bool,
    initialLoad: PropTypes.bool,
    isReverse: PropTypes.bool,
    loader: PropTypes.object,
    loadStopper: PropTypes.object,
    loadPagesBeforeStop: PropTypes.number,
    loadMore: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    pageStart: PropTypes.number,
    pageSize: PropTypes.number,
    renderPagesCount: PropTypes.number,
    ref: PropTypes.func,
    thresholdTop: PropTypes.number,
    thresholdBottom: PropTypes.number,
    useCapture: PropTypes.bool,
    useWindow: PropTypes.bool
  };

  static defaultProps = {
    element: 'div',
    hasMore: false,
    initialLoad: true,
    pageStart: 1,
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

  constructor(props) {
    super(props);
    this.scrollListener = _.throttle(this.scrollListener.bind(this), 500);
    this.state = {
      items: [],
      visiblePage: null,
      loadTopCount: 0,
      loadBottomCount: 0,
      stopLoadBottom: false,
      stopLoadTop: false
    }
  }

  componentDidMount() {
    // page at pageStart is not yet loaded
    this.pageLoaded = this.props.pageStart - 1;
    // first page is loaded automatically, therefore minPageLoaded is the page number after initial pageLoaded (== pageStart)
    this.minPageLoaded = this.props.pageStart;
    this.onePageHeight = null;
    this.isInitialScroll = true;
    this.lastLoadWasBefore = false;
    this.attachScrollListener();
  }

  componentDidUpdate() {
    if ((this.isInitialScroll || this.lastLoadWasBefore) && this.pageLoaded !== 1 && this.pageLoaded === this.props.pageStart) {
      window.scrollTo(0,this.props.thresholdTop + 1);
      this.isInitialScroll = false;
      this.lastLoadWasBefore = false;
    }
    this.attachScrollListener();
  }

  componentWillUnmount() {
    this.detachScrollListener();
  }

  // Set a defaut loader for all your `InfiniteScroll` components
  setDefaultLoader(loader) {
    this.defaultLoader = loader;
  }

  detachScrollListener() {
    let scrollEl = window;
    if (this.props.useWindow === false) {
      scrollEl = this.scrollComponent.parentNode;
    }

    scrollEl.removeEventListener('scroll', this.scrollListener, this.props.useCapture);
    scrollEl.removeEventListener('resize', this.scrollListener, this.props.useCapture);
  }

  attachScrollListener() {
    let scrollEl = window;
    if (this.props.useWindow === false) {
      scrollEl = this.scrollComponent.parentNode;
    }
    scrollEl.addEventListener('scroll', this.scrollListener, this.props.useCapture);
    scrollEl.addEventListener('resize', this.scrollListener, this.props.useCapture);
    if (this.props.initialLoad) {
      this.scrollListener();
    }
  }

  reset() {
    this.pageLoaded = 0;
    this.minPageLoaded = 1;
    this.props.onPageChange(1);
    this.isInitialScroll = false;
    this.lastLoadWasBefore = false;
    this.setState(
      {
        items: [],
        loadTopCount: 0,
        loadBottomCount: 0,
        stopLoadBottom: false,
        stopLoadTop: false
      }
    );
  }

  getA(items, page) {
    let anchorElement1 = React.createElement('a', {key: page+'start', href: '#' + page, className: 'page-anchor', 'data-page': page});
    let anchorElement2 = React.createElement('a', {key: page+'end', href: '#' + page, className: 'page-anchor', 'data-page': page});
    return [anchorElement1, ...items, anchorElement2];
  }

  scrollOnePage() {
    if (this.onePageHeight === null) {
      let anchors = document.getElementsByClassName('page-anchor');
      this.onePageHeight = this.calculateTopPosition(anchors[1]) - this.calculateTopPosition(anchors[0]);
    }
    window.scrollTo(0, this.getScrollTop() + this.onePageHeight);
  }

  afterLoadMore(items, page) {
    this.setState((prevState, props) => {
      return {
        items: prevState.items.concat(this.getA(items, page)),
        loadBottomCount: prevState.loadBottomCount + 1,
        stopLoadBottom: prevState.loadBottomCount > (props.loadPagesBeforeStop-1) ? true : false
      }
    });
  }

  afterLoadBefore(items, page) {
    this.lastLoadWasBefore = true;
    this.setState((prevState, props) => {
      return {
        items: this.getA(items, page).concat(prevState.items),
        loadTopCount: prevState.loadTopCount + 1,
        stopLoadTop: prevState.loadTopCount > (props.loadPagesBeforeStop-2) ? true : false
      }
    });
    this.scrollOnePage();
  }

  getScrollTop() {
    const scrollTop = (window.pageYOffset !== undefined) ?
      window.pageYOffset :
      (document.documentElement || document.body.parentNode || document.body).scrollTop;
    return scrollTop;
  }

  enableLoadMoreTop() {
    this.setState({
      stopLoadTop: false,
      loadTopCount: 0
    });
  }

  enableLoadMoreBottom() {
    window.scrollBy(0, -1 * this.props.thresholdBottom);
    this.setState({
      stopLoadBottom: false,
      loadBottomCount: 0
    });
  }

  getVisiblePage() {
    let anchors = document.getElementsByClassName('page-anchor');
    for (let anchor of anchors) {
      if (this.calculateTopPosition(anchor) > this.getScrollTop()) {
        return parseInt(anchor.getAttribute('data-page'));
      }
    }
  }

  scrollListener() {
    const el = this.scrollComponent;
    const scrollEl = window;

    let offset;
    let offsetTop;
    if (this.props.useWindow) {
      const scrollTop = this.getScrollTop();
      if (this.props.isReverse) {
        offset = scrollTop;
      } else {
        offset = this.calculateTopPosition(el) +
                     (el.offsetHeight -
                     scrollTop -
                     window.innerHeight);
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
    }
    else if (offsetTop < Number(this.props.thresholdTop) && !this.state.stopLoadTop) {
      if (this.minPageLoaded > 1) {
        this.detachScrollListener();
        // Call loadMore after detachScrollListener to allow for non-async loadMore functions
        if (typeof this.props.loadMore === 'function') {
          this.props.loadMore(this.minPageLoaded -= 1, this.afterLoadBefore.bind(this));
        }
      }
    }

    let visiblePage = this.getVisiblePage();
    if (visiblePage && this.state.visiblePage !== visiblePage) {
      this.setState({visiblePage: visiblePage}, this.props.onPageChange(visiblePage));
    }
  }

  calculateTopPosition(el) {
    if (!el) {
      return 0;
    }
    return el.offsetTop + this.calculateTopPosition(el.offsetParent);
  }

  render() {
    const {
      element,
      hasMore,
      initialLoad,
      isReverse,
      loader,
      loadStopper,
      loadMore,
      loadPagesBeforeStop,
      onPageChange,
      pageStart,
      pageSize,
      renderPagesCount,
      ref,
      thresholdTop,
      thresholdBottom,
      useCapture,
      useWindow,
      ...props
    } = this.props;

    props.ref = (node) => {
      this.scrollComponent = node;
      if (ref) {
        ref(node);
      }
    };

    let childrenArray = this.state.items.slice(0);

    if (this.props.pageSize) {
      const startRenderIndex = Math.max(0, ((this.state.visiblePage - this.minPageLoaded) - this.props.renderPagesCount) * (this.props.pageSize + 2));
      const endRenderIndex = Math.max(this.props.pageSize + 2, ((this.state.visiblePage - this.minPageLoaded + 1) + this.props.renderPagesCount) * (this.props.pageSize + 2));
      childrenArray = childrenArray.slice(startRenderIndex, endRenderIndex);
    }

    if (this.state.visiblePage > 1 && this.state.stopLoadTop) {
      childrenArray.unshift(React.createElement('a',
        {
          onClick: this.enableLoadMoreTop.bind(this),
          className: 'loader-link top'
        },
        this.props.loadStopper))
    }

    if (hasMore && this.state.stopLoadBottom) {
      childrenArray.push(React.createElement('a',
        {
          onClick: this.enableLoadMoreBottom.bind(this),
          className: 'loader-link bottom'
        },
        this.props.loadStopper))
    }

    if (hasMore && !this.state.stopLoadBottom) {
      if (loader) {
        isReverse ? childrenArray.unshift(loader) : childrenArray.push(loader);
      } else if (this.defaultLoader) {
        isReverse ?
          childrenArray.unshift(this.defaultLoader) :
          childrenArray.push(this.defaultLoader);
      }
    }
    // disable loader
    if (false && this.minPageLoaded > 1 && !this.state.stopLoadTop) {
      if (loader) {
        childrenArray.unshift(loader);
      }
      else {
        childrenArray.unshift(this.defaultLoader);
      }
    }
    return React.createElement(
        element,
        props,
        ...childrenArray,
    );
  }
}
