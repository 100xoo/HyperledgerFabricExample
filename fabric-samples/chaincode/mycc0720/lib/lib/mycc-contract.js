/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyccContract extends Contract {

    async myccExists(ctx, myccId) {
        const buffer = await ctx.stub.getState(myccId);
        return (!!buffer && buffer.length > 0);
    }

    async createMycc(ctx, myccId, value) {
        const exists = await this.myccExists(ctx, myccId);
        if (exists) {
            throw new Error(`The mycc ${myccId} already exists`);
        }
        const asset = { value };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myccId, buffer);
    }

    async readMycc(ctx, myccId) {
        const exists = await this.myccExists(ctx, myccId);
        if (!exists) {
            throw new Error(`The mycc ${myccId} does not exist`);
        }
        const buffer = await ctx.stub.getState(myccId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateMycc(ctx, myccId, newValue) {
        const exists = await this.myccExists(ctx, myccId);
        if (!exists) {
            throw new Error(`The mycc ${myccId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(myccId, buffer);
    }

    async deleteMycc(ctx, myccId) {
        const exists = await this.myccExists(ctx, myccId);
        if (!exists) {
            throw new Error(`The mycc ${myccId} does not exist`);
        }
        await ctx.stub.deleteState(myccId);
    }

}

module.exports = MyccContract;
