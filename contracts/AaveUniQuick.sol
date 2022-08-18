// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./utils/FlashLoanReceiverBase.sol";
import "./utils/Withdrawable.sol";
import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/interfaces/IQuoter.sol";
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';
import "./interfaces/IUniswapV2Router02.sol";
import "./interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract AaveUniQuick is FlashLoanReceiverBase, Withdrawable {

    //Note: Quickswap and Sushiswap are a fork of Uniswap. So the API are essentially the same.
    IUniswapV2Router02 public immutable quickRouter;
    ISwapRouter public immutable uniswapV3Router;
    // IQuoter public immutable uniswapV3Quoter;
    IUniswapV2Router02 public immutable sushiRouter;
    address immutable sushiswapfactoryAddress;
    address immutable quickswapfactoryAddress;

    constructor( 
    IPoolAddressesProvider _aaveAddressProvider,
    address _uniswapV3Router,
    address _sushiswapRouterAddress,
    address _sushiswapfactory,
    address _quickswapV2RouterAddress,
    address _quickswapfactory
    ) 
    FlashLoanReceiverBase(_aaveAddressProvider) {
        uniswapV3Router = ISwapRouter(_uniswapV3Router);
        quickRouter = IUniswapV2Router02(_quickswapV2RouterAddress);
        sushiRouter = IUniswapV2Router02(_sushiswapRouterAddress);
        sushiswapfactoryAddress = _sushiswapfactory;
        quickswapfactoryAddress = _quickswapfactory;
    }


    struct FlashParams {
        address token0; //Token to borrow from Aave
        address token1; //second token in the Uniswap borrow pool
        uint24 pool1Fee; //Uniswap borrow pool fee tier
        uint256 amount0; //Aave borrow amount
        uint24 pool2Fee;
        address sharedAddress;
        bool uniuniquick;
        bool uniunisushi;
        bool uniquick;
        bool unisushi;
        bool quickuni;
        bool quicksushi;
        bool sushiuni;
        bool sushiquick;
    }


    event AaveBorrowDetails(
        address indexed _borrowedAsset,
        uint indexed _amount,
        uint _premium
    );

    // event TokensSwapped(
    //     address indexed _token0,
    //     uint256 indexed _token0Out,
    //     address indexed _token1,
    //     uint256 _token1Out
    // );


    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address /* initiator */,
        bytes calldata params 
    )
        external
        override
        returns (bool)
        {

        address borrowedAsset = assets[0];
        uint256 borrowedAmount = amounts[0];
        uint256 premium = premiums[0];
        
        // This contract now has the funds requested.
        // Your logic goes here.
        require(msg.sender == address(POOL), "Not pool");
        uint256 tokenBalance = IERC20(borrowedAsset).balanceOf(address(this));
        require(borrowedAmount > 0, "Zero balance");
        require(tokenBalance == borrowedAmount, "tokenBalance error!");

        emit AaveBorrowDetails(borrowedAsset, borrowedAmount, premium);

        FlashParams memory decoded = abi.decode(params, (FlashParams));
        //If you borrowed from Aave, proceed to also start UniswapQuickswaps BUT this time, you
        //have the borrowed asset from Aave in this contract.
        startUniswapV3AndQuickSwaps(decoded); //My code passed this line!


        // At the end of your logic above, this contract owes
        // the flashloaned amounts + premiums.
        // Therefore ensure your contract has enough to repay
        // these amounts
        uint256 amountToReturn = borrowedAmount + premium;
        require(IERC20(borrowedAsset).balanceOf(address(this)) >= amountToReturn,
            "Not enough amount to return loan"
        );

        require(IERC20(borrowedAsset).approve(address(POOL), amountToReturn), "approve failed");      
        return true;
    }

    /*
    *  Flash loan 1,000,000,000,000,000,000 wei (1 ether) worth of `_asset`
    */
    function startTransaction(FlashParams memory _data) public onlyOwner{
        address _borrowAsset = _data.token0;
        uint256 _borrowAmount = _data.amount0;

        bytes memory params = abi.encode(_data);

        address[] memory assets = new address[](1);
        assets[0] = _borrowAsset;

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = _borrowAmount;

        _flashloan(assets, amounts, params);
    }


    function _flashloan(address[] memory assets, uint256[] memory amounts, bytes memory params) internal {

        //We send the flashloan amount to this contract (receiverAddress) so we can make the arbitrage trade
        address receiverAddress = address(this);

        address onBehalfOf = address(this);

        uint16 referralCode = 0;

        uint256[] memory modes = new uint256[](assets.length);

        // 0 = no debt (flash), 1 = stable, 2 = variable
        for (uint256 i = 0; i < assets.length; i++) {
            modes[i] = 0;
        }


        POOL.flashLoan(
            receiverAddress,
            assets,
            amounts,
            modes,
            onBehalfOf,
            params,
            referralCode
        );
    }

    function startUniswapV3AndQuickSwaps(FlashParams memory params) internal {

        address token0 = params.token0;
        address token1 = params.token1;
        uint24 pool1Fee = params.pool1Fee;
        address sharedAddress = params.sharedAddress;
        uint24 pool2Fee = params.pool2Fee;
        uint256 amount = IERC20(token0).balanceOf(address(this));
        require(amount > 0, "Token bal not positive");


        uint256 finalAmountOut;
        uint256 amountOut;
        if(params.uniuniquick) {
            amountOut = multihopSwapOnUniswap(
                amount,
                token0,  //input token
                pool1Fee, //fee tier for token0 and sharedAddress pool
                sharedAddress, //token common to the pools
                pool2Fee, //fee tier for sharedAddress and token1 pool
                token1  //output token
            );

            //If it is greater than zero, then no need to swap again to a different token
            //Just use the token we started with so we can repay our debt with it
            if(token0 != token1){
                finalAmountOut = swapOnQuickswap(
                amountOut,
                token1,   //input token
                token0); //output token
            }

        }else if(params.uniunisushi){
            amountOut = multihopSwapOnUniswap(
                amount,
                token0,  //input token
                pool1Fee, //fee tier for token0 and sharedAddress pool
                sharedAddress, //token common to the pools
                pool2Fee, //fee tier for sharedAddress and token1 pool
                token1  //output token
            );

            if(token0 != token1){
                finalAmountOut = swapOnSushiswapV2(token1, amountOut, token0);

            }

        }else if (params.uniquick) {  //uniquick just means swap on uniswap first then quickswap
            amountOut = swapOnUniswap(
                amount,
                token0,  //input token
                token1, //output token
                pool1Fee //The pool fee.
            );

            finalAmountOut = swapOnQuickswap(
                amountOut,
                token1,   //input token
                token0    //output token
            );

        }else if(params.unisushi){
            amountOut = swapOnUniswap(
                amount,
                token0,  //input token
                token1, //output token
                pool1Fee 
            );

                           //From token1 => targetAsset
            finalAmountOut = swapOnSushiswapV2(token1, amountOut, token0);

        }else if(params.quickuni) {
            amountOut = swapOnQuickswap(
                amount,
                token0,   //input token
                token1   //output token
            );

            finalAmountOut = swapOnUniswap(
                amountOut,
                token1,  //input token
                token0,  //output token
                pool1Fee
            );

        }else if(params.quicksushi){
            amountOut = swapOnQuickswap(
                amount,
                token0,   //input token
                token1   //output token
            );

                            //From token1 => targetAsset
            finalAmountOut = swapOnSushiswapV2(token1, amountOut, token0);

        }else if(params.sushiuni){
                           //From token0 => targetAsset
            amountOut = swapOnSushiswapV2(token0, amount, token1);
            
            finalAmountOut = swapOnUniswap(
                amountOut,
                token1,  //input token
                token0,  //output token
                pool1Fee
            );

        }else if(params.sushiquick){
            amountOut = swapOnSushiswapV2(token0, amount, token1);

            finalAmountOut = swapOnQuickswap(
                amountOut,
                token1,   //input token
                token0    //output token
            );

        }else{
            revert();
        }
    }

    function swapOnUniswap(
        uint256 amountIn,
        address inputToken,
        address outputToken,
        uint24 poolFee
    ) internal returns (uint256) {
        TransferHelper.safeApprove(inputToken, address(uniswapV3Router), amountIn);
        
            ISwapRouter.ExactInputSingleParams memory params = 
                ISwapRouter.ExactInputSingleParams({
                    tokenIn: inputToken,
                    tokenOut: outputToken,
                    fee: poolFee,
                    recipient: address(this),  //Where the outbound token amount goes to
                    deadline: block.timestamp + 200,
                    amountIn: amountIn,
                    amountOutMinimum: 0,
                    sqrtPriceLimitX96: 0
                });

        //The call to `exactInputSingle` executes the swap.
        uint256 amountOut = uniswapV3Router.exactInputSingle(params); 
        return amountOut;       
    }   


    function multihopSwapOnUniswap(
    uint256 amountIn,
    address inputToken,
    uint24 pool1Fee,
    address sharedAddress,
    uint24 pool2Fee,
    address outputToken
    ) internal returns (uint256) {
        TransferHelper.safeApprove(inputToken, address(uniswapV3Router), amountIn);

        // Multiple pool swaps are encoded through bytes called a `path`. A path is a sequence of token addresses and poolFees that define the pools used in the swaps.
        // The format for pool encoding is (tokenIn, fee, tokenOut/tokenIn, fee, tokenOut) where tokenIn/tokenOut parameter is the shared token across the pools.
        // Since we are swapping DAI to USDC and then USDC to WETH9 the path encoding is (DAI, 0.3%, USDC, 0.3%, WETH9).
        ISwapRouter.ExactInputParams memory params = ISwapRouter
            .ExactInputParams({
                path: abi.encodePacked(
                    inputToken,
                    pool1Fee,
                    sharedAddress, //e.g dai to weth to usdc ...Then weth is the shared address
                    pool2Fee,
                    outputToken
                ),
                recipient: address(this),
                deadline: block.timestamp + 200,
                amountIn: amountIn,
                amountOutMinimum: 0
            });

        // The call to `exactInput` executes the multihop swap.
        uint256 amountOut = uniswapV3Router.exactInput(params);
        return amountOut;
    }


    function swapOnQuickswap(
        uint256 amountIn,
        address inputToken,
        address outputToken
    ) internal returns (uint256) {
        // Get pool address and check if it exists
        address poolAddress = IUniswapV2Factory(quickswapfactoryAddress).getPair(
            inputToken,
            outputToken
        );

        require(poolAddress != address(0), "Pool not found!");
        //+-We allow the router of QuickSwapRouter to spend all our tokens that are neccesary in doing the trade:
        IERC20(inputToken).approve(address(quickRouter), amountIn);

        uint256 amountOutMin = (_getPrice(
            address(quickRouter),
            inputToken,
            outputToken,
            amountIn
        ) * 95) / 100;

        //+-Array of the 2 Tokens Addresses:
        address[] memory path = new address[](2);
        //+-Defines the Direction of the Trade (From Token0 to Token1 or vice versa):
        path[0] = inputToken;  //path[0] is the token we want to sell
        path[1] = outputToken;


        //+-We Sell in QuickSwap the Tokens we Borrowed 
        uint256 amountOut = quickRouter.swapExactTokensForTokens(
            amountIn, /**+-Amount of Tokens we are going to Sell.*/
            amountOutMin, /**+-Minimum Amount of Tokens that we expect to receive in exchange for our Tokens.*/
            path, /**+-We tell SushiSwap what Token to Sell and what Token to Buy.*/
            address(this), /**+-Address of this S.C. where the Output Tokens are going to be received.*/
            block.timestamp + 200 /**+-Time Limit after which an order will be rejected by SushiSwap(It is mainly useful if you send an Order directly from your wallet).*/
        )[1];
        
        return amountOut;
    }

    function swapOnSushiswapV2(address _startAsset, uint256 _amount, address _targetAsset) internal returns(uint256){

        // Get pool address and check if it exists
        address poolAddress = IUniswapV2Factory(sushiswapfactoryAddress).getPair(
            _startAsset,
            _targetAsset
        );

        require(poolAddress != address(0), "Pool not found!");

        IERC20(_startAsset).approve(address(sushiRouter), _amount);

        uint256 amountOutMin = (_getPrice(
            address(sushiRouter),
            _startAsset,
            _targetAsset,
            _amount
        ) * 95) / 100; //Meaning I am expecting to receive at least 95% of the price out.

        address[] memory path = new address[](2);
        path[0] = _startAsset;
        path[1] = _targetAsset;

        uint256 amountOut = sushiRouter.swapExactTokensForTokens(
            _amount, /* Amount of Tokens we are going to Sell. */
            amountOutMin, /* Minimum Amount of Tokens that we expect to receive in exchange for our Tokens. */
            path, /* We tell SushiSwap what token to sell and what token to Buy. */
            address(this), /* Address of where the Output Tokens are going to be received. i.e this contract address(this) */
            block.timestamp + 200 /* Time Limit after which an order will be rejected by SushiSwap(It is mainly useful if you send an Order directly from your wallet). */
        )[1];

        return amountOut;
    }


    function _getPrice(
        address routerAddress,
        address sell_token,
        address buy_token,
        uint256 amount
    ) internal view returns (uint256) {
        address[] memory pairs = new address[](2);
        pairs[0] = sell_token;
        pairs[1] = buy_token;

        //The return price is in Eth...So you can always multiply by 10**18 to convert to wei
        uint256 price = IUniswapV2Router02(routerAddress).getAmountsOut(
            amount,
            pairs
        )[1];

        return price;
    }
}