/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MyccContract } = require('..');
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

describe('MyccContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new MyccContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"mycc 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"mycc 1002 value"}'));
    });

    describe('#myccExists', () => {

        it('should return true for a mycc', async () => {
            await contract.myccExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a mycc that does not exist', async () => {
            await contract.myccExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMycc', () => {

        it('should create a mycc', async () => {
            await contract.createMycc(ctx, '1003', 'mycc 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"mycc 1003 value"}'));
        });

        it('should throw an error for a mycc that already exists', async () => {
            await contract.createMycc(ctx, '1001', 'myvalue').should.be.rejectedWith(/The mycc 1001 already exists/);
        });

    });

    describe('#readMycc', () => {

        it('should return a mycc', async () => {
            await contract.readMycc(ctx, '1001').should.eventually.deep.equal({ value: 'mycc 1001 value' });
        });

        it('should throw an error for a mycc that does not exist', async () => {
            await contract.readMycc(ctx, '1003').should.be.rejectedWith(/The mycc 1003 does not exist/);
        });

    });

    describe('#updateMycc', () => {

        it('should update a mycc', async () => {
            await contract.updateMycc(ctx, '1001', 'mycc 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"mycc 1001 new value"}'));
        });

        it('should throw an error for a mycc that does not exist', async () => {
            await contract.updateMycc(ctx, '1003', 'mycc 1003 new value').should.be.rejectedWith(/The mycc 1003 does not exist/);
        });

    });

    describe('#deleteMycc', () => {

        it('should delete a mycc', async () => {
            await contract.deleteMycc(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a mycc that does not exist', async () => {
            await contract.deleteMycc(ctx, '1003').should.be.rejectedWith(/The mycc 1003 does not exist/);
        });

    });

});
