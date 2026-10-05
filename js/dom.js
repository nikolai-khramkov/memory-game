export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);

  if (props.className) {
    node.className = props.className;
  }

  if (props.text != null) {
    node.textContent = String(props.text);
  }

  if (props.attrs) {
    for (const [name, value] of Object.entries(props.attrs)) {
      node.setAttribute(name, String(value));
    }
  }

  if (props.on) {
    for (const [type, handler] of Object.entries(props.on)) {
      node.addEventListener(type, handler);
    }
  }

  for (const child of children) {
    if (child != null) {
      node.append(child);
    }
  }

  return node;
}
