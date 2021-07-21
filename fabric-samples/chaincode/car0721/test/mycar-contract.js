/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { MycarContract } = require('..');
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

describe('MycarContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new MycarContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"mycar 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"mycar 1002 value"}'));
    });

    describe('#mycarExists', () => {

        it('should return true for a mycar', async () => {
            await contract.mycarExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a mycar that does not exist', async () => {
            await contract.mycarExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createMycar', () => {

        it('should create a mycar', async () => {
            await contract.createMycar(ctx, '1003', 'mycar 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"mycar 1003 value"}'));
        });

        it('should throw an error for a mycar that already exists', async () => {
            await contract.createMycar(ctx, '1001', 'myvalue').should.be.rejectedWith(/The mycar 1001 already exists/);
        });

    });

    describe('#readMycar', () => {

        it('should return a mycar', async () => {
            await contract.readMycar(ctx, '1001').should.eventually.deep.equal({ value: 'mycar 1001 value' });
        });

        it('should throw an error for a mycar that does not exist', async () => {
            await contract.readMycar(ctx, '1003').should.be.rejectedWith(/The mycar 1003 does not exist/);
        });

    });

    describe('#updateMycar', () => {

        it('should update a mycar', async () => {
            await contract.updateMycar(ctx, '1001', 'mycar 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"mycar 1001 new value"}'));
        });

        it('should throw an error for a mycar that does not exist', async () => {
            await contract.updateMycar(ctx, '1003', 'mycar 1003 new value').should.be.rejectedWith(/The mycar 1003 does not exist/);
        });

    });

    describe('#deleteMycar', () => {

        it('should delete a mycar', async () => {
            await contract.deleteMycar(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a mycar that does not exist', async () => {
            await contract.deleteMycar(ctx, '1003').should.be.rejectedWith(/The mycar 1003 does not exist/);
        });

    });

});
