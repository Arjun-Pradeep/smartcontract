### 1. Clone the git repository and install the dependencies

>git clone https://github.com/Arjun-Pradeep/smartcontract.git
>cd smartcontract
>npm i --save

### 2. Create a .env file and add the Infura Key, PrivateKey & ropsten API key
>touch .env
![Screenshot](/docs/env.png)

###  3. Compile the smart contracts
>npx hardhat compile


### 4. To run the test cases 
>npx hardhat test

### 5. To deploy the smart contracts (token & crowdsale) [ROPSTEN]
>npx hardhat run scripts/deploy.js --network ropsten

![Screenshot](/docs/deploy.png)


### 6. To verify the smart contracts (token & crowdsale)
>npx hardhat verify --constructor-args scripts/CONSTRUCTOR_ARGUMENTS_FILE CONTRACT_ADDRESS --network ropsten

![Screenshot](/docs/deploy2.png)

![Screenshot](/docs/deploy3.png)
![Screenshot](/docs/deploy4.png)

<b>CONSTRUCTOR_ARGUMENTS_FILE</b> : javascript module that exports the argument list.

<b>CONTRACT_ADDRESS</b> : Contract Address of the respective smart contracts
