import '../css/style.css'
import supplyChainArtifact from '../../build/contracts/SupplyChain.json'

let App = {
    web3Provider: null,
    web3: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",
    meta: null,

    init: async function () {
        await App.initWeb3();
        App.readForm();
        /// Setup access to blockchain
        App.bindEvents();
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        console.log(
            App.sku,
            App.upc,
            App.ownerID, 
            App.originFarmerID, 
            App.originFarmName, 
            App.originFarmInformation, 
            App.originFarmLatitude, 
            App.originFarmLongitude, 
            App.productNotes, 
            App.productPrice, 
            App.distributorID, 
            App.retailerID, 
            App.consumerID
        );
    },

    initWeb3: async function () {
        if (window.ethereum) {
            App.web3 = new Web3(Web3.givenProvider);  
            await window.ethereum.enable()
        } else {
            App.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"),);
        }

        await App.getMetaskAccountID();
        return App.initSupplyChain();
    },

    getMetaskAccountID: async function () {
        try {
            const accounts = await App.web3.eth.getAccounts();
            console.log(accounts)
            App.metamaskAccountID = accounts[0];
        } catch (err) {
            console.log("Error retrieving account", error);
        }
    },

    initSupplyChain: async function () {
        const { web3 } = App;

        try {
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = supplyChainArtifact.networks[networkId];
            this.meta = await new web3.eth.Contract(
                supplyChainArtifact.abi,
                deployedNetwork.address,
            );
            console.log(deployedNetwork)
            console.log(networkId)
        } catch (err) {
            console.log("Could not connect to contract", error);
        }
        await App.fetchEvents();
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
        event.preventDefault();

        var processId = parseInt($(event.target).data('id'));
        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            }
    },

    harvestItem: async function(event) {
        const { harvestItem, recordHistory } = this.meta.methods
        try {
            const upc = $("#upc").val()
            let result = await harvestItem(parseInt(upc),
                this.metamaskAccountID,
                $("#originFarmName").val(),
                $('#originFarmInformation').val(),
                $('#originFarmLatitude').val(),
                $('#originFarmLongitude').val(),
                $('#productNotes').val(),).send({ from: App.metamaskAccountID })
            console.log('harvestItem', result)
            await this.fetchItemBufferTwo();
            await recordHistory(upc, result.transactionHash).call({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while harvesting item.', error)
            return
        }
    },

    processItem: async function (event) {
        const { processItem, recordHistory } = this.meta.methods
        try {
            let result = await processItem(this.upc).send({ from: App.metamaskAccountID })
            console.log('processItem', result)
            await this.fetchItemBufferTwo();
            await recordHistory(this.upc, result.transactionHash).call({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while processing item.', error)
            return
        }
    },
    
    packItem: async function (event) {
        const { packItem, recordHistory } = this.meta.methods
        try {
            let result = await packItem(this.upc).send({ from: App.metamaskAccountID })
            console.log('packItem', result)
            await this.fetchItemBufferTwo();
            await recordHistory(this.upc, result.transactionHash).call({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while packing item.', error)
            return
        }
    },

    sellItem: async function (event) {
        const { sellItem, recordHistory } = this.meta.methods
        try {
            let productPrice = $('#productPrice').val()
            const price = App.web3.utils.toWei(productPrice, "ether")
            let result = await sellItem(this.upc, price).send({ from: App.metamaskAccountID })
            console.log('sellItem', result)
            await this.fetchItemBufferTwo();
            await recordHistory(this.upc, result.transactionHash).call({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while selling item.', error)
            return
        }
    },

    buyItem: async function (event) {
        const { buyItem, recordHistory } = this.meta.methods
        try {
            let productPrice = $('#productPrice').val()
            const price = App.web3.utils.toWei(productPrice, "ether")
            console.log(price)
            let result = await buyItem(this.upc).send({ from: App.metamaskAccountID, value: price })
            console.log('buyItem', result)
            await this.fetchItemBufferTwo();
            await recordHistory(this.upc, result.transactionHash).call({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while buying item.', error)
            return
        }
    },

    shipItem: async function (event) {
        const { shipItem, recordHistory } = this.meta.methods
        try {
            let result = await shipItem(this.upc).send({ from: App.metamaskAccountID})
            console.log('shipItem', result)
            await this.fetchItemBufferTwo();
            await recordHistory(this.upc, result.transactionHash).call({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while shipping item.', error)
            return
        }
    },

    receiveItem: async function (event) {
        const { receiveItem, recordHistory } = this.meta.methods
        try {
            let result = await receiveItem(this.upc).send({ from: App.metamaskAccountID})
            console.log('receiveItem', result)
            await this.fetchItemBufferTwo();
            await recordHistory(this.upc, result.transactionHash).call({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while receiving item.', error)
            return
        }
    },

    purchaseItem: async function (event) {
        const { purchaseItem, recordHistory } = this.meta.methods
        try {
            let productRetailPrice = $('#productRetailPrice').val()
            const price = App.web3.utils.toWei(productRetailPrice, "ether")
            console.log(price)
            let result = await purchaseItem(this.upc).send({ from: App.metamaskAccountID, value: price})
            console.log('purchaseItem', result)
            await this.fetchItemBufferTwo();
            await recordHistory(this.upc, result.transactionHash).call({ from: App.metamaskAccountID })
        } catch (error) {
            console.log('Error while purchasing item.', error)
            return
        }
    },

    fetchItemBufferOne: async function () {
        let upc = $('#upc').val()
        const { fetchItemBufferOne } = this.meta.methods
        try {
            let result = await fetchItemBufferOne(upc).call()
            console.log(result)
            $("#sku").val(result[0])
            $("#ownerID").html(result[2])
            $("#originFarmerID").val(result[3])
            $("#originFarmName").val(result[4])
            $("#originFarmInformation").val(result[5])
            $("#originFarmLatitude").val(result[6])
            $("#originFarmLongitude").val(result[7])

            this.upc = result[1]
            
        } catch (error) {
            console.log(error)
            throw new Error('Error while fetching Item buffer one.')
        }
    },

    fetchItemBufferTwo: async function () {
        let upc = $('#upc').val()
        const { fetchItemBufferTwo } = this.meta.methods
        try {
            let result = await fetchItemBufferTwo(upc).call()

            const productPriceEth = Web3.utils.fromWei(result[4], 'ether');
            const productRetailPriceEth = Web3.utils.fromWei(result[9], 'ether');

            $("#productNotes").val(result[3])
            $("#productPrice").val(productPriceEth)
            $("#itemStateInfo").text(result[5])
            $("#distributorID").val(result[6])
            $("#retailerID").val(result[7])
            $("#consumerID").val(result[8])
            $("#productRetailPrice").val(productRetailPriceEth)
        } catch (error) {
            console.log(error)
            throw new Error('Error while fetching Item buffer one.')
        }
    },

    fetchEvents: async function () {
        try {
            let events = await this.meta.getPastEvents('allEvents', { fromBlock: 0, toBlock: 'latest' })
            events.forEach(async (log) => {
                $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
            })
        } catch (error) {
            console.log('error while fetching events.', error)
            throw new Error('Error while fetching events')
        }

        // add subscription to automatically refresh events
        await App.meta.events.allEvents().on('data', log => {
            console.log('received event: ', log)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');

        }).on('error', (error, receipt) => {
            console.log('received event error: ', error)
            console.log('received recept error: ', receipt)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        })
    }
};

$(window).on('load', function () {
    App.init();
})