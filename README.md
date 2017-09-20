React Infinite Scroller
=======================

Infinitely load content using a React Component. This fork maintains a simple, lightweight infinite scroll package that supports both `window` and scrollable elements.

## Installation

```
npm install https://github.com/dlmna/react-infinite-scroller.git --save
```
```
yarn add https://github.com/dlmna/react-infinite-scroller.git
```

## How to use

```js
import InfiniteScroll from 'react-infinite-scroller';
```

### Window scroll events

```js

<InfiniteScroll
    pageStart={ 1 }
    loadMore={ this.loadData.bind(this) }
    hasMore={ true|false }
    onPageChange={ this.onPageChange.bind(this) }
    thresholdTop={ 250 }
    thresholdBottom={ 250 }
    loader={ <div className="loader">Loading ...</div> }
    loadStopper={ <div className="load-stopper">Click here to load more</div> }
    loadPagesBeforeStop={ 3 }
    renderPagesCount={ 3 }
    pageSize={ this.state.pageSize }
    ref={ (scroll) => { this.scroll = scroll; } }
/>


```

### Sample Handlers
```js
    loadData(page, cb) {
        let self = this;
        Api.getData(page)
            .then(function(json) {
                let result = [];
                json.results.map(function(data, index){ result.push( <SampleComponent key={page+'-'+index} {...data} /> )} );
                cb(result, page);
            }).catch(function(ex) {
                console.log(ex);
            });
    }

    onPageChange(page) {
        // handle page change
        ...
    }

    resetScroll() {
        // clear all pages
        // causes reloading at page 1
        this.scroll.reset();
    }
```

## Props

| Name             | Type          | Default    | Description|
|:----             |:----          |:----       |:----|
| `pageStart`      | `Number`      | `1`        | Initial page. |
| `loadMore`       | `func`        |            | Callback to load fresh pages |
| `hasMore`        | `Boolean`     | `false`    | Indicates if it is to load more at the end of the list |
| `onPageChange`   | `func`        |            | Callback to handle page change |
| `thresholdTop`   | `Number`      | `250`      | Threshold before loading more data at top |
| `thresholdBottom`| `Number`      | `250`      | Threshold before loading more data at bottom |
| `loader`         | `'div'`       | `null`     | The Element shown while loading |
| `loadStopper`    | `'div'`       |`'load more'`| The element shown when loadPagesBeforeStop is exceeded |
|`renderPagesCount`| `Number`      | `2`        | Number of pages that should be rendered before and after current page |
| `pageSize`       | `Number`      | `null`     | Number of elements per page. *Required for rendering pages according to renderPagesCount.* |
| `ref`            | `func`        | `null`     | Callback to get reference to scroll component |
