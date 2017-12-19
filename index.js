// import { types as t } from "@babel/core";

const setAttribute = (t, attributes, name, value) => {
  let isAttributeSet = false;

  if (!attributes) {
    attributes = [];
  }

  for (let i in attributes) {
    if (!attributes.hasOwnProperty(i)) {
      continue;
    }

    // Overriding the value if attribute exists
    if (attributes[i].name.name === name) {
      attributes[i] = t.JSXAttribute(t.JSXIdentifier(name),
                                     t.StringLiteral(value)
                                    );
      isAttributeSet = true;
    }
  }

  // add new attribute if existing attribute wasn't overriden
  if (!isAttributeSet) {
    attributes.unshift(
      t.JSXAttribute(t.JSXIdentifier(name),
                     t.StringLiteral(value)
                    )
    );
  }
};

const setImageSourceAttribute = (t, attributes) => {
    if (!attributes) {
      attributes = [];
    }

    for (let i in attributes) {
      if (!attributes.hasOwnProperty(i)) {
        continue;
      }

      // Overriding the value if attribute exists
      if (attributes[i].name.name === 'src') {
        attributes[i] = t.JSXAttribute(t.JSXIdentifier('source'),
                                       t.StringLiteral(attributes[i].value.value)
                                      );
      }
    }
};

const getAttributeValue = (t, attributes, propertyName) => {
    let propertyValue = null;
    
    if (!attributes) {
        return propertyValue;
    }
    
    for (let i in attributes) {
        if (!attributes.hasOwnProperty(i)) {
            continue;
        }
        
        if (attributes[i].name.name === propertyName) {
            propertyValue = attributes[i].value.value;
        }
    }
    return propertyValue;
};

const removeAttribute = (t, attributes, propertyName) => {
    if (!attributes) {
        return;
    }
    
    for (let i in attributes) {
        if (!attributes.hasOwnProperty(i)) {
            continue;
        }
        
        if (attributes[i].name.name === propertyName) {
            delete attributes[i];
        }
    }
};

const TextTags = [
    'a', 'abbr', 'address',
    'b', 'bdi', 'bdo', 'big', 'blockquote', 'br',
    'cite', 'code',
    'data', 'del', 'dfn',
    'em',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'i', 'ins',
    'kbd',
    'label', 'legend',
    'mark', 'marquee', 'meter',
    'output',
    'p', 'pre',
    'q',
    'rp', 'rt', 'ruby',
    's', 'samp', 'small', 'span', 'strong', 'sub', 'summary', 'sup',
    'time',
    'u',
    'var',
    'wbr'
];

const ImageTags = [
    'img'
];

const ViewTags = [
    'area', 'article', 'aside', 'audio',
    'base',  'body', 'button',
    'canvas', 'caption', 'col', 'colgroup',
    'datalist', 'dd', 'details', 'dialog', 'div', 'dl', 'dt',
    'embed',
    'fieldset', 'figcaption', 'figure', 'footer', 'form',
    'head', 'header', 'hgroup', 'hr', 'html',
    'iframe', 'input',
    'keygen',
    'li', 'link',
    'main', 'map', 'menu', 'menuitem', 'meta',
    'nav', 'noscript',
    'object', 'ol', 'optgroup', 'option',
    'param', 'picture', 'progress',
    'script', 'section', 'select', 'source', 'style',
    'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'title', 'tr', 'track',
    'ul',
    'video'
];

const SVGTags = [
    'circle', 'clipPath',
    'defs',
    'ellipse',
    'g',
    'image',
    'line', 'linearGradient',
    'mask',
    'path', 'pattern', 'polygon', 'polyline',
    'radialGradient', 'rect',
    'stop', 'svg',
    'text', 'tspan'
];


module.exports = function ({types: t }) {
  const DefaultPrimitives = {};

  for (const tag of TextTags) {
    DefaultPrimitives[tag] = 'Text';
  }
  for (const tag of ImageTags) {
    DefaultPrimitives[tag] = 'Image';
  }
  for (const tag of ViewTags) {
    DefaultPrimitives[tag] = 'View';
  }

  return {
    visitor: {
      TaggedTemplateExpression(path, state) {
        const objectName = path.node.tag && path.node.tag.object && path.node.tag.object.name || false;
        const tagName = path.node.tag && path.node.tag.property && path.node.tag.property.name || false;
      	const Primitives = Object.assign(DefaultPrimitives, state.opts.primitives);
        const isPrimitiveTag = tagName && Object.keys(Primitives).includes(tagName);
        const isStyledComponents = objectName && objectName === 'styled';

        if (isStyledComponents && isPrimitiveTag) {
           path.node.tag = t.CallExpression(t.Identifier('styled'), [t.Identifier(Primitives[tagName])]);
           // path.node.tag = t.MemberExpression(t.Identifier('styled'), t.Identifier(Primitives[tagName]));
        }
      },
      JSXIdentifier(path, state) {
        const tagNameProp = state.opts.tagNameProp;
        const primitiveProp = state.opts.primitiveProp;
        const Primitives = Object.assign(DefaultPrimitives, state.opts.primitives);

        let tagName = path.node.name,
            isPrimitiveTag = Object.keys(Primitives).includes(tagName),
            primitive = null;

        if (primitiveProp) {
            primitive = getAttributeValue(t, path.parent.attributes, primitiveProp);
          	removeAttribute(t, path.parent.attributes, primitiveProp);
        }
        else if (isPrimitiveTag) {
        	primitive = Primitives[tagName];
        }
        
        if (primitive !== null) {
            path.node.name = primitive;

          	if (tagNameProp) {
        		setAttribute(t, path.parent.attributes, tagNameProp, tagName);
            }
            if (path.node.name === 'Image') {
                setImageSourceAttribute(t, path.parent.attributes);
            }
        }

        // Ignore attributes
        path.stop();

      },
      JSXText(path, state) {
        return;
        if(path.parent.openingElement.name.name !== 'Text') {
        let text = path.node.value.replace(/^[\s]+/, '').replace(/[\s]+$/, '');
        if (text.length > 0) {
          let prefixWhitespace = path.node.value.replace(/[\s]+$/, '').replace(text, '');
          let suffixWhitespace = path.node.value.replace(/^[\s]+/, '').replace(text, '');

          path.replaceWithMultiple([
            t.JSXText(prefixWhitespace),
            t.JSXElement(
              t.JSXOpeningElement(
                t.JSXIdentifier('Text'),
                []
              ),
              t.JSXClosingElement(
                t.JSXIdentifier('Text')
              ),
              [t.JSXText(text)]
            ),
            t.JSXText(suffixWhitespace)
          ]);
        }
        }

      }
    }
  };
};
