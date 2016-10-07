// Polyfill for Buffer.from on pre-Meteor 1.4 which using Node 0.12
if (!Buffer.from) {
  console.log('Adding buffer.from polyfill');
  Buffer.from = (string) => {
    return new Buffer(string);
  }
} else {
  console.log('Using a modern version of node');
}