"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _helperPluginUtils() {
  const data = require("@babel/helper-plugin-utils");

  _helperPluginUtils = function () {
    return data;
  };

  return data;
}

function _pluginSyntaxIIFE() {
  const data = _interopRequireDefault(require("../plugin-syntax-iife"));

  _pluginSyntaxIIFE = function () {
    return data;
  };

  return data;
}

function _core() {
  const data = require("@babel/core");

  _core = function () {
    return data;
  };

  return data;
}

function _parser() {
  const data = require("@babel/parser");

  _parser = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = (0, _helperPluginUtils().declare)(api => {
  api.assertVersion(7);

  return {
    name: "proposal-iife",
//    inherits: _pluginSyntaxIIFE().default,
    parserOverride: function() {
      const types = _parser().tokTypes;

      const oldNameUpdateContext = types.name.updateContext;
      _parser().tokTypes.name.updateContext = function() {

        const oldGetTokenFromCode = this.getTokenFromCode;
        this.getTokenFromCode = function(code) {
          if (code == 58 && this.state.input.charCodeAt(this.state.pos + 1) === 62) {
            this.state.pos += 2;
            this.finishToken(types.arrow, ":>");
            return;
          }
          return oldGetTokenFromCode.apply(this, arguments);
        }.bind(this);

        const oldReadToken_eq_excl = this.readToken_eq_excl;
        this.readToken_eq_excl = function(code) {
          if (code === 61 && this.state.input.charCodeAt(this.state.pos + 1) === 62) {
              this.state.pos += 2;
              this.finishToken(types.arrow, "=>");
              return;
          }
          return oldReadToken_eq_excl.apply(this, arguments);
        }.bind(this);

        const oldParseAsyncArrowFromCallExpression = this.parseAsyncArrowFromCallExpression;
        this.parseAsyncArrowFromCallExpression = function(node, call) {
            const maybeIIFE = this.state.value === ':>';
            oldParseAsyncArrowFromCallExpression.apply(this, arguments);
            node.isIIFE = maybeIIFE;
            return node;
        }.bind(this);

        const oldParseArrow = this.parseArrow;
        this.parseArrow = function(node) {
          const maybeIIFE = this.state.value === ':>';
          const ret = oldParseArrow.apply(this, arguments);
          if (ret) {
            ret.isIIFE = maybeIIFE;
          }
          return ret;
        }.bind(this);

        const oldParseExprAtom = this.parseExprAtom;
        this.parseExprAtom = function(refShorthandDefaultPos) {
          let maybeIsIIFE;
          const canBeArrow = this.state.potentialArrowAt === this.state.start;
          if (canBeArrow && this.state.type === types.name) {
            const old = this.state;
            this.state = old.clone(true);
            this.isLookahead = true;

            const id = this.parseIdentifier();

            if (id.name === "async" && this.match(types.name) && !this.canInsertSemicolon()) {
              this.state.inAsync = true;
              this.parseIdentifier();
              maybeIsIIFE = this.state.value === ":>";
            } else if (this.match(types.arrow) && !this.canInsertSemicolon()) {
              maybeIsIIFE = this.state.value === ":>";
            }

            this.isLookahead = false;
            this.state = old;
          }

          let ret = oldParseExprAtom.apply(this, arguments);
          if (maybeIsIIFE !== undefined) {
            ret.isIIFE = maybeIsIIFE;
          }
          return ret;
        }.bind(this);

        _parser().tokTypes.name.updateContext = oldNameUpdateContext;
        return oldNameUpdateContext.apply(this, arguments);
      };
    },

    visitor: {
      ArrowFunctionExpression(path) {
        if (path.node.isIIFE) {
          path.node.isIIFE = false;
          const node = path.node.__clone();
          node.type = "CallExpression";
          node.callee = path.node;
          node.arguments = [];
          path.replaceWith(node);
        }
      }
    }
  };
});

exports.default = _default;