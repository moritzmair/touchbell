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
    const chars = [...new Set([...$bells]
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

    if (!char) {
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

  /**
   * Loads all elements and registers event listeners.
   */
  const init = () => {
    // load elements
    $filter = document.querySelector('.alphabetical-filter')
    $filterItems = $filter.querySelectorAll('.alphabetical-filter-item')
    $bells = document.querySelectorAll('.bell')

    filterFilterItems();

    // register click handler on
    // on all not inactive items
    [...$filterItems]
      .filter($item => !$item.classList.contains(inactiveClass))
      .forEach($item => $item.addEventListener('click', onFilterItemClick));
  };

  window.addEventListener('DOMContentLoaded', init);
})();
