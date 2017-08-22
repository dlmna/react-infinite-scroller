import React, {
  Component,
} from 'react';
import PropTypes from 'prop-types';

export default class InfiniteScroll extends Component {
  static propTypes = {
    children: PropTypes
      .oneOfType([PropTypes.object, PropTypes.array])
      .isRequired,
    element: PropTypes.string,
    hasMore: PropTypes.bool,
    hasMoreBefore: PropTypes.bool,
    initialLoad: PropTypes.bool,
    isReverse: PropTypes.bool,
    loader: PropTypes.object,
    loadMore: PropTypes.func.isRequired,
    loadBefore: PropTypes.func.isRequired,
    onPageChange: PropTypes.func.isRequired,
    pageStart: PropTypes.number,
    ref: PropTypes.func,
    threshold: PropTypes.number,
    useCapture: PropTypes.bool,
    useWindow: PropTypes.bool,
  };

  static defaultProps = {
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
    loader: null,
  };

  constructor(props) {
    super(props);
    this.scrollListener = this.scrollListener.bind(this);
  }

  componentDidMount() {
    // page at pageStart is not yet loaded
    this.pageLoaded = this.props.pageStart - 1;
    // first page is loaded automatically, therefore minPageLoaded is the page number after initial pageLoaded (== pageStart)
    this.minPageLoaded = this.props.pageStart;
    this.onePageHeight = null;
    this.visiblePage = null;
    this.attachScrollListener();
  }

  componentDidUpdate() {
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
    if (!this.props.hasMore && !this.props.hasMoreBefore) {
      return;
    }

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

  afterLoadMore() {
    if (this.onePageHeight === null && this.pageLoaded === this.props.pageStart) {
      this.onePageHeight = this.scrollComponent.offsetHeight;
    }
  }

  afterLoadBefore() {
    if (this.onePageHeight === null && this.pageLoaded === this.props.pageStart) {
      this.onePageHeight = this.scrollComponent.offsetHeight;
    }
    const scrollTop = (window.pageYOffset !== undefined) ?
      window.pageYOffset :
      (document.documentElement || document.body.parentNode || document.body).scrollTop;
    window.scrollTo(0, scrollTop + this.onePageHeight);
  }

  scrollListener() {
    const el = this.scrollComponent;
    const scrollEl = window;

    let offset;
    let offsetTop;
    if (this.props.useWindow) {
      const scrollTop = (scrollEl.pageYOffset !== undefined) ?
        scrollEl.pageYOffset :
        (document.documentElement || document.body.parentNode || document.body).scrollTop;
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

    if (offset < Number(this.props.threshold)) {
      this.detachScrollListener();
      // Call loadMore after detachScrollListener to allow for non-async loadMore functions
      if (typeof this.props.loadMore === 'function') {
        this.props.loadMore(this.pageLoaded += 1, this.afterLoadMore.bind(this));
      }
    }
    else if (offsetTop < Number(this.props.threshold)) {
      if (this.minPageLoaded > 1) {
        this.detachScrollListener();
        // Call loadBefore after detachScrollListener to allow for non-async loadBefore functions
        if (typeof this.props.loadBefore === 'function') {
          this.props.loadBefore(this.minPageLoaded -= 1, this.afterLoadBefore.bind(this));
        }
      }
      else {
        this.hasMoreBefore = false;
      }
    }

    if (this.onePageHeight) {
      let visiblePage = ( offsetTop - this.calculateTopPosition(el) ) / this.onePageHeight;
      visiblePage = Math.round(visiblePage) + this.minPageLoaded;
      console.log('visible page #', visiblePage);
      if (this.visiblePage !== visiblePage) {
        this.visiblePage = visiblePage;
        this.props.onPageChange(this.visiblePage);
      }
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
      children,
      element,
      hasMore,
      hasMoreBefore,
      initialLoad,
      isReverse,
      loader,
      loadMore,
      loadBefore,
      onPageChange,
      pageStart,
      ref,
      threshold,
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

    const childrenArray = [children];
    if (hasMore) {
      if (loader) {
        isReverse ? childrenArray.unshift(loader) : childrenArray.push(loader);
      } else if (this.defaultLoader) {
        isReverse ?
          childrenArray.unshift(this.defaultLoader) :
          childrenArray.push(this.defaultLoader);
      }
    }
    if (hasMoreBefore) {
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
