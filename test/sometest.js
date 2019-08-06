const expect = require('chai').expect;

it("sometest", function () {
    let foo = 'Hello World';
    expect(foo).to.be.a('string');
    expect(foo).to.equal('Hello World');
    expect(foo).to.have.lengthOf(11);
});