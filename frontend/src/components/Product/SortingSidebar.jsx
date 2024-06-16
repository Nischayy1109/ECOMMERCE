//import React from 'react';
import PropTypes from 'prop-types';

const SortingSidebar = ({ sortOption, setSortOption }) => {
  return (
    <div className="w-64 p-4 bg-gray-200 border-r border-gray-300">
      <h2 className="text-lg font-bold mb-4">Sort By</h2>
      <div className="flex flex-col space-y-2">
        <button
          className={`p-2 rounded ${sortOption === 'rating' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          onClick={() => setSortOption('rating')}
        >
          Rating
        </button>
        <button
          className={`p-2 rounded ${sortOption === 'alphabetical' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          onClick={() => setSortOption('alphabetical')}
        >
          Alphabetical
        </button>
        <button
          className={`p-2 rounded ${sortOption === 'price' ? 'bg-blue-500 text-white' : 'bg-white'}`}
          onClick={() => setSortOption('price')}
        >
          Price
        </button>
      </div>
    </div>
  );
};

SortingSidebar.propTypes = {
  sortOption: PropTypes.string.isRequired,
  setSortOption: PropTypes.func.isRequired,
};

export default SortingSidebar;
