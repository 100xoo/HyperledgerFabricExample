/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyorderContract } = require('..');
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

describe('MyorderContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new MyorderContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"myorder 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"myorder 1002 value"}'));
    });

    describe('#myorderExists', () => {

        it('should return true for a myorder', async () => {
            await contract.myorderExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a myorder that does not exist', async () => {
            await contract.myorderExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMyorder', () => {

        it('should create a myorder', async () => {
            await contract.createMyorder(ctx, '1003', 'myorder 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"myorder 1003 value"}'));
        });

        it('should throw an error for a myorder that already exists', async () => {
            await contract.createMyorder(ctx, '1001', 'myvalue').should.be.rejectedWith(/The myorder 1001 already exists/);
        });

    });

    describe('#readMyorder', () => {

        it('should return a myorder', async () => {
            await contract.readMyorder(ctx, '1001').should.eventually.deep.equal({ value: 'myorder 1001 value' });
        });

        it('should throw an error for a myorder that does not exist', async () => {
            await contract.readMyorder(ctx, '1003').should.be.rejectedWith(/The myorder 1003 does not exist/);
        });

    });

    describe('#updateMyorder', () => {

        it('should update a myorder', async () => {
            await contract.updateMyorder(ctx, '1001', 'myorder 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"myorder 1001 new value"}'));
        });

        it('should throw an error for a myorder that does not exist', async () => {
            await contract.updateMyorder(ctx, '1003', 'myorder 1003 new value').should.be.rejectedWith(/The myorder 1003 does not exist/);
        });

    });

    describe('#deleteMyorder', () => {

        it('should delete a myorder', async () => {
            await contract.deleteMyorder(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a myorder that does not exist', async () => {
            await contract.deleteMyorder(ctx, '1003').should.be.rejectedWith(/The myorder 1003 does not exist/);
        });

    });

});
