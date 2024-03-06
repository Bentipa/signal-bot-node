"use strict";

/**
 * An extension of the native Map class with convenience features.
 */
class ExtMap extends Map {
  /**
   * Returns an Array of all values.
   */
  array() {
    return [...this.values()];
  }
}

export default ExtMap;
