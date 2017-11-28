# babel-plugin-transform-html-to-primitives

Transforms HTML tags in JSX to their Primitive equivalents

## Example

**In**

```js
import React from 'react';
import { Image, View, Text } from 'react-primitives';
import styled from 'styled-components/primitives';


const ButtonElement = styled.button`
    height: 50px;
    padding: 0 10px;
    border-radius: 3px;
	background-color: #595959;
`;

const textStyle = {
    lineHeight: 50,
    color: '#FFFFFF',
    textAlign: 'center'
};


const Button = ({ relative }) => (
  <ButtonElement>
  	<img src="/photo.jpg" alt={relative} />
  	<span style={textStyle}>Luke, I am your <strong className="relative">{relative}</strong>.</span>
  </ButtonElement>
);

Button.defaultProps = {
    relative: 'father'
};

export default Button;
```

**Out**

```js
import React from 'react';
import { Image, View, Text } from 'react-primitives';
import styled from 'styled-components/primitives';


const ButtonElement = styled(View)`
    height: 50px;
    padding: 0 10px;
    border-radius: 3px;
	background-color: #595959;
`;

const textStyle = {
    lineHeight: 50,
    color: '#FFFFFF',
    textAlign: 'center'
};


const Button = ({ relative }) => (
  <ButtonElement>
  	<Image source="/photo.jpg" alt={relative} />
  	<Text style={textStyle}>Luke, I am your <Text className="relative">{relative}</Text>.</Text>
  </ButtonElement>
);

Button.defaultProps = {
    relative: 'father'
};

export default Button;
```

## Installation

```sh
$ npm install babel-plugin-transform-html-to-primitives
```

## Usage

### Via `.babelrc` (Recommended)

**.babelrc**

```json
{
  "plugins": ["transform-html-to-primitives"]
}
```

### Via CLI

```sh
$ babel --plugins transform-html-to-primitives script.js
```

### Via Node API

```javascript
require("babel-core").transform("code", {
  plugins: ["transform-html-to-primitives"]
});
```
