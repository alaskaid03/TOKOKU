export const toSlug = (str) => str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
export const genSKU = (name) => 'SKU-' + name.substring(0,3).toUpperCase().replace(/\s/g,'') + '-' + Date.now().toString().slice(-6)
export const genOrderNumber = () => 'ORD-' + Date.now().toString().slice(-8) + Math.floor(Math.random()*90+10)
