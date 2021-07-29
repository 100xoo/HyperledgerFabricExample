/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { ItemContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('ItemContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new ItemContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"item 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"item 1002 value"}'));
    });

    describe('#itemExists', () => {

        it('should return true for a item', async () => {
            await contract.itemExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a item that does not exist', async () => {
            await contract.itemExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createItem', () => {

        it('should create a item', async () => {
            await contract.createItem(ctx, '1003', 'item 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"item 1003 value"}'));
        });

        it('should throw an error for a item that already exists', async () => {
            await contract.createItem(ctx, '1001', 'myvalue').should.be.rejectedWith(/The item 1001 already exists/);
        });

    });

    describe('#readItem', () => {

        it('should return a item', async () => {
            await contract.readItem(ctx, '1001').should.eventually.deep.equal({ value: 'item 1001 value' });
        });

        it('should throw an error for a item that does not exist', async () => {
            await contract.readItem(ctx, '1003').should.be.rejectedWith(/The item 1003 does not exist/);
        });

    });

    describe('#updateItem', () => {

        it('should update a item', async () => {
            await contract.updateItem(ctx, '1001', 'item 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"item 1001 new value"}'));
        });

        it('should throw an error for a item that does not exist', async () => {
            await contract.updateItem(ctx, '1003', 'item 1003 new value').should.be.rejectedWith(/The item 1003 does not exist/);
        });

    });

    describe('#deleteItem', () => {

        it('should delete a item', async () => {
            await contract.deleteItem(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a item that does not exist', async () => {
            await contract.deleteItem(ctx, '1003').should.be.rejectedWith(/The item 1003 does not exist/);
        });

    });

});
