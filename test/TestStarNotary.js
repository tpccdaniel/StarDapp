const StarNotary = artifacts.require("StarNotary");

var accounts;
var owner;

contract('StarNotary', (accs) => {
    accounts = accs;
    owner = accounts[0];
});

it('can Create a Star', async() => {
    let starTokenId = 1;
    let instance = await StarNotary.deployed();
    await instance.createStar('Star Name', starTokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(starTokenId), 'Star Name')
});

it('can add the star name and star symbol properly', async() => {
    let starTokenId = 2;
    let instance = await StarNotary.deployed();
    await instance.createStar('Star Name', starTokenId, {from: accounts[0]})
    assert.equal(await instance.tokenIdToStarInfo.call(starTokenId), 'Star Name');
    assert.equal(await instance.name.call(), 'Andromeda')
    assert.equal(await instance.symbol.call(), 'Circle')
});

it('lets user1 put up their star for sale', async() => {
    let starTokenId = 3;
    let instance = await StarNotary.deployed();
    let starPrice = web3.utils.toWei(".01", "ether");
    await instance.createStar('Andromeda', starTokenId, {from: accounts[0]})
    await instance.putStarUpForSale(starTokenId, starPrice);
    assert.equal(await instance.starsForSale.call(starTokenId), starPrice);
});

it('lets user1 get the funds after the sale', async() => {
    let starTokenId = 4;
    let instance = await StarNotary.deployed();

    let user1 = accounts[1];
    let user2 = accounts[2];

    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");

    await instance.createStar('Tau Ceti', starTokenId, {from: user1});
    await instance.putStarUpForSale(starTokenId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user1);
    await instance.buyStar(starTokenId, {from: user2, value: balance});
    let balanceOfUser1AfterTransaction = await web3.eth.getBalance(user1);
    let value1 = Number(balanceOfUser1BeforeTransaction) + Number(starPrice);
    let value2 = Number(balanceOfUser1AfterTransaction);
    assert.equal(value1, value2);
});

it('lets user2 buy a star, if it is put up for sale', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 5;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance});
    assert.equal(await instance.ownerOf.call(starId), user2);
});

it('lets user2 buy a star and decreases its balance in ether', async() => {
    let instance = await StarNotary.deployed();
    let user1 = accounts[1];
    let user2 = accounts[2];
    let starId = 6;
    let starPrice = web3.utils.toWei(".01", "ether");
    let balance = web3.utils.toWei(".05", "ether");
    await instance.createStar('awesome star', starId, {from: user1});
    await instance.putStarUpForSale(starId, starPrice, {from: user1});
    let balanceOfUser1BeforeTransaction = await web3.eth.getBalance(user2);
    const balanceOfUser2BeforeTransaction = await web3.eth.getBalance(user2);
    await instance.buyStar(starId, {from: user2, value: balance, gasPrice:0});
    const balanceAfterUser2BuysStar = await web3.eth.getBalance(user2);
    let value = Number(balanceOfUser2BeforeTransaction) - Number(balanceAfterUser2BuysStar);
    assert.equal(value, starPrice);
});

it('lets 2 users exchange stars', async() => {
    // 1. create 2 Stars with different tokenId
    // 2. Call the exchangeStars functions implemented in the Smart Contract
    // 3. Verify that the owners changed

    let instance = await StarNotary.deployed();
    let starId1 = 7;
    let starId2 = 8;

    await instance.createStar('Newton', starId1, {from: accounts[0]});
    await instance.createStar('Kepler', starId2, {from: accounts[1]});

    await instance.exchangeStars(starId1, starId2);

    assert.equal(await instance.ownerOf(starId1), accounts[1]);
    assert.equal(await instance.ownerOf(starId2), accounts[0]);
});

it('lets a user transfer a star', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    await instance.createStar('Alpha Centauri', 9, {from: accounts[0]});
    // 2. use the transferStar function implemented in the Smart Contract
    await instance.transferStar(accounts[1], 9);
    // 3. Verify the star owner changed.
    assert.equal(await instance.ownerOf.call(9), accounts[1]);
});

it('lookUptokenIdToStarInfo test', async() => {
    // 1. create a Star with different tokenId
    let instance = await StarNotary.deployed();
    await instance.createStar('Alpha Centauri', 10, {from: accounts[0]});
    // 2. Call your method lookUptokenIdToStarInfo
    let starName = await instance.lookUptokenIdToStarInfo(10);
    // 3. Verify if you Star name is the same
    assert.equal(starName, 'Alpha Centauri');
});



