// Copyright 2007 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Factory class to create a rich autocomplete that will match
 * from an array of data provided via ajax.  The server returns a complex data
 * structure that is used with client-side javascript functions to render the
 * results.
 *
 * The server sends a list of the form:
 *   [["type1", {...}, {...}, ...], ["type2", {...}, {...}, ...], ...]
 * The first element of each sublist is a string designating the type of the
 * hashes in the sublist, each of which represents one match.  The type string
 * must be the name of a function(item) which converts the hash into a rich
 * row that contains both a render(node, token) and a select(target) method.
 * The render method is called by the renderer when rendering the rich row,
 * and the select method is called by the RichInputHandler when the rich row is
 * selected.
 *
 * @see ../../demos/autocompleterichremote.html
 */

goog.provide('goog.ui.ac.RichRemote');

goog.require('goog.ui.ac.AutoComplete');
goog.require('goog.ui.ac.Remote');
goog.require('goog.ui.ac.Renderer');
goog.require('goog.ui.ac.RichInputHandler');
goog.require('goog.ui.ac.RichRemoteArrayMatcher');



/**
 * Factory class to create a rich autocomplete widget that autocompletes an
 * inputbox or textarea from data provided via ajax.  The server returns a
 * complex data structure that is used with client-side javascript functions to
 * render the results.
 *
 * @param {string} url The Uri which generates the auto complete matches.
 * @param {Element} input Input element or text area.
 * @param {boolean=} opt_multi Whether to allow multiple entries; defaults
 *     to false.
 * @param {boolean=} opt_useSimilar Whether to use similar matches; e.g.
 *     "gost" => "ghost".
 * @constructor
 * @extends {goog.ui.ac.Remote}
 */
goog.ui.ac.RichRemote = function(url, input, opt_multi, opt_useSimilar) {
  // Create a custom renderer that renders rich rows.  The renderer calls
  // row.render(node, token) for each row.
  var customRenderer = {};
  customRenderer.renderRow = function(row, token, node) {
    return row.data.render(node, token);
  };

  /**
   * A standard renderer that uses a custom row renderer to display the
   * rich rows generated by this autocomplete widget.
   * @type {goog.ui.ac.Renderer}
   * @private
   */
  this.renderer_ = new goog.ui.ac.Renderer(null, customRenderer);

  /**
   * A remote matcher that parses rich results returned by the server.
   * @type {goog.ui.ac.RichRemoteArrayMatcher}
   * @private
   */
  this.matcher_ = new goog.ui.ac.RichRemoteArrayMatcher(url, !opt_useSimilar);

  /**
   * An input handler that calls select on a row when it is selected.
   * @type {goog.ui.ac.RichInputHandler}
   * @private
   */
  var inputhandler =
      new goog.ui.ac.RichInputHandler(null, null, !!opt_multi, 300);

  // Create the widget and connect it to the input handler.
  goog.ui.ac.AutoComplete.call(
      this, this.matcher_, this.renderer_, inputhandler);
  inputhandler.attachAutoComplete(this);
  inputhandler.attachInputs(input);
};
goog.inherits(goog.ui.ac.RichRemote, goog.ui.ac.Remote);


/**
 * Set the filter that is called before the array matches are returned.
 * @param {Function} rowFilter A function(rows) that returns an array of rows as
 *     a subset of the rows input array.
 */
goog.ui.ac.RichRemote.prototype.setRowFilter = function(rowFilter) {
  this.matcher_.setRowFilter(rowFilter);
};


/**
 * Sets the function building the rows.
 * @param {goog.ui.ac.RichRemoteArrayMatcher.RowBuilder} rowBuilder
 *     A function(type, response) converting the type and the server response to
 *     an object with two methods: render(node, token) and select(target).
 */
goog.ui.ac.RichRemote.prototype.setRowBuilder = function(rowBuilder) {
  this.matcher_.setRowBuilder(rowBuilder);
};
