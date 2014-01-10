/**
 * Copyright 2012 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Definitions of all options for TimeMachineCanvasLayer.
 * @author Brendan Kenny
 */

/**
 * Options for a TimeMachineCanvasLayer.
 *
 * @interface
 */
function TimeMachineCanvasLayerOptions() {}

/**
 * If true, updateHandler will be called repeatedly, once per frame. If false,
 * updateHandler will only be called when a map property changes that could
 * require the canvas content to be redrawn.
 * @type {boolean}
 */
TimeMachineCanvasLayerOptions.prototype.animate;

/**
 * Map on which to overlay the canvas.
 * @type {google.maps.Map}
 */
TimeMachineCanvasLayerOptions.prototype.timeMachine;

/**
 * The name of the MapPane in which this layer will be displayed. See
 * {@code google.maps.MapPanes} for the panes available. Default is
 * "overlayLayer".
 * @type {string}
 */
TimeMachineCanvasLayerOptions.prototype.paneName;

/**
 * A function that is called whenever the canvas has been resized to fit the
 * map.
 * @type {function}
 */
TimeMachineCanvasLayerOptions.prototype.resizeHandler;

/**
 * A function that is called when a repaint of the canvas is required.
 * @type {function}
 */
TimeMachineCanvasLayerOptions.prototype.updateHandler;
