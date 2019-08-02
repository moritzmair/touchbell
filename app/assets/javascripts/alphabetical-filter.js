(() => {
  const selectedClass = 'selected';
  const inactiveClass = 'inactive';
  const timeout = 1000 * 20;
  let $filter = null;
  let $filterItems = [];
  let $bells = [];
  let resetTimeout = null;

  /**
   * Filters all filter items and sets the inactive class to all items, which are
   * which have no corrosponding bells.
   */
  const filterFilterItems = () => {
    // get all first bell name chars
    // and unique it with Set
    // and append #
    const chars = ['#', ...new Set([...$bells]
      .map($bell => $bell.getAttribute('data-name').toLowerCase().substr(0, 1)))];

    // remove all not needed characters from filter
    [...$filterItems]
      .filter($item => !chars.includes($item.textContent.toLowerCase()))
      .forEach($item => {
        $item.classList.add(inactiveClass);
      })
  };

  /**
   * Filters all bells by selected filter item.
   *
   * @param {string|null} char
   */
  const filterBells = (char = null) => {
    // show all bells
    $bells.forEach($bell => {
      $bell.classList.remove('hide');
    })

    if (!char || char === '#') {
      $filterItem = [...$filterItems].find($item => $item.textContent === '#');
      $filterItem.classList.add('selected');
      return;
    }

    // hide if names first char not matches char
    $bells.forEach($bell => {
      if ($bell.getAttribute('data-name').toLowerCase().substr(0, 1) !== char) {
        $bell.classList.add('hide');
      }
    })
  };

  /**
   * Removes the selected class from all filter items.
   */
  const removeSelectedClass = () => {
    $filterItems.forEach(item => item.classList.remove(selectedClass))
  };

  /**
   * Handles a click on a filter item.
   *
   * @param {MouseEvent|TouchEvent} event
   */
  const onFilterItemClick = (event) => {
    event.preventDefault();

    // remove selected class from all items
    removeSelectedClass();

    // add selected class to clicked item
    event.target.classList.add(selectedClass)

    // trigger filter
    filterBells(event.target.textContent.toLowerCase())

    // clear existing timeout
    if (resetTimeout) {
      clearTimeout(resetTimeout);
    }

    // set timeout after which all gets resetted
    resetTimeout = setTimeout(() => {
      filterBells(null);
      removeSelectedClass();
    }, timeout)
  };

  const renderFilterItems = () => {
    const numbers = new Array(10)
      .fill(null)
      .map((_, index) => String.fromCharCode(48 + index));

    const characters = new Array(26)
      .fill(null)
      .map((_, index) => String.fromCharCode(65 + index));

    const chars = ['#', ...numbers, ...characters];
    const $fragment = document.createDocumentFragment();
    const $filterItems = chars.map((char) => {
      // create item and set options
      const $span = document.createElement('span')
      $span.className = 'alphabetical-filter-item';
      $span.textContent = char;

      // add item to fragment
      $fragment.appendChild($span);

      // return node
      return $span;
    });

    // add fragment with all items to filter
    $filter.appendChild($fragment);

    return $filterItems;
  };

  /**
   * Loads all elements and registers event listeners.
   */
  const init = () => {
    // load elements
    $filter = document.querySelector('.alphabetical-filter')
    $filterItems = renderFilterItems();
    $bells = document.querySelectorAll('.bell')

    filterFilterItems();
    filterBells(null);

    // register click handler on
    // on all not inactive items
    [...$filterItems]
      .filter($item => !$item.classList.contains(inactiveClass))
      .forEach($item => $item.addEventListener('click', onFilterItemClick));
  };

  window.addEventListener('DOMContentLoaded', init);
})();
