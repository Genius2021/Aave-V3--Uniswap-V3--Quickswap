// // SPDX-License-Identifier: GPL-2.0-or-later
// pragma solidity >=0.7.6;
// // pragma solidity >=0.6.6

// pragma abicoder v2;

// import "@uniswap/v3-core/contracts/interfaces/callback/IUniswapV3FlashCallback.sol";
// import "@uniswap/v3-core/contracts/libraries/LowGasSafeMath.sol";

// import "@uniswap/v3-periphery/contracts/base/PeripheryPayments.sol";
// import "@uniswap/v3-periphery/contracts/base/PeripheryImmutableState.sol";
// import "@uniswap/v3-periphery/contracts/libraries/PoolAddress.sol";
// import "@uniswap/v3-periphery/contracts/libraries/CallbackValidation.sol";
// import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
// import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
// import "./SushiswapV2.sol";


// contract UniQuick is
//     IUniswapV3FlashCallback,
//     PeripheryImmutableState,
//     PeripheryPayments,
//     SushiswapV2
// {
//     using LowGasSafeMath for uint256;
//     using LowGasSafeMath for int256;

//     //Note: Quickswap and Sushiswap are a fork of Uniswap. So the API are essentially the same.
//     IUniswapV2Router02 quickRouter;
//     ISwapRouter public immutable uniswapV3Router;
//     address internal WETH = 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619;
//     address uniswapV3factory;

//     constructor(
//         address _uniswapV3RouterAddress,
//         address _sushiswapRouterAddress, 
//         address _uniswapV3factory,
//         address sushiswapfactoryAddress, 
//         // address _WETH9, 
//         address _quickswapV2RouterAddress
//     ) 
//     PeripheryImmutableState(_uniswapV3factory, WETH) 
//     SushiswapV2(_sushiswapRouterAddress, sushiswapfactoryAddress){
//         uniswapV3Router = ISwapRouter(_uniswapV3RouterAddress);
//         quickRouter = IUniswapV2Router02(_quickswapV2RouterAddress);
//         // WETH = _WETH9;
//         uniswapV3factory = _uniswapV3factory;
//     }

//     event UniswapBorrowDetails(
//         address indexed _borrowedAsset,
//         address indexed _secondPair,
//         uint indexed _amountBorrowed,
//         uint24 _poolFee
//     );

//     event TokensSwapped(
//         address indexed _startToken,
//         uint256 indexed _startAmount,
//         uint256 _endAmount
//     );

//     struct FlashParams {
//         bool AaveBorrow;
//         address token0; //Token to borrow from Aave
//         address token1; //second token in the Uniswap borrow pool
//         address token2; //swapping pair on sushi swap
//         uint24 fee1; //Uniswap borrow pool fee tier...This is the fee tier for the pool I borrowed from (fee1...Which is the first pool)
//         uint256 amount0; //Aave borrow amount
//         uint256 amount1; //Uniswap borrow amount (token 1)
//         uint256 amount2; //Uniswap borrow amount (token 2)
//         uint24 fee2;
//         uint24 fee3;
//         address sharedAddress;
//         bool uniuniquick;
//         bool uniquick;
//         bool unisushi;
//         bool quickuni;
//         bool quicksushi;
//         bool sushiuni;
//         bool sushiquick;
//     }
    
//     struct FlashCallbackData {
//         uint256 amount1;
//         uint256 amount2;
//         address token2; //target pair
//         address payer;
//         PoolAddress.PoolKey poolKey;
//         uint24 pool2Fee;
//         uint24 pool3Fee;
//         address sharedAddress;
//         bool uniuniquick;
//         bool uniquick;
//         bool unisushi;
//         bool quickuni;
//         bool quicksushi;
//         bool sushiuni;
//         bool sushiquick;
//     }

//     function uniswapV3FlashCallback(
//         uint256 fee0,
//         uint256 fee1,
//         bytes calldata data
//     ) external override {
//         FlashCallbackData memory decoded = abi.decode(
//             data,
//             (FlashCallbackData)
//         );
//         CallbackValidation.verifyCallback(uniswapV3factory, decoded.poolKey);

//         address token0 = decoded.poolKey.token0;
//         address token1 = decoded.poolKey.token1;
//         uint24 pool1Fee = decoded.poolKey.fee;
//         address sharedAddress = decoded.sharedAddress;
//         uint24 pool2Fee = decoded.pool2Fee;
//         uint24 pool3Fee = decoded.pool3Fee;

//         emit UniswapBorrowDetails(token0, token1, decoded.amount1, pool1Fee);

//         //Get the total balance for token0 (total = Aave borrowed + Uniswap borrowed)
//         uint256 tokenBalance = IERC20(token0).balanceOf(address(this));

//         uint256 finalAmountOut;
//         if(decoded.uniuniquick){
//             uint256 amountOut = multihopSwapOnUniswap(
//                 tokenBalance,
//                 token0,  //input token
//                 pool2Fee, //fee tier for token0 and sharedAddress pool
//                 sharedAddress, //token common to the pools
//                 pool3Fee, //fee tier for sharedAddress and token1 pool
//                 token1  //output token
//             );

//             //If it is greater than zero, then no need to swap again to a different token
//             //Just use the token we started with so we can repay our debt with it
//             if(IERC20(token0).balanceOf(address(this)) > 0 ){
//                 return;
//             }else{
//                 finalAmountOut = swapOnQuickswap(
//                 amountOut,
//                 token1,   //input token
//                 token0    //output token
//             );

//             }

//             emit TokensSwapped(token0, tokenBalance, finalAmountOut);
//         }

//         if (decoded.uniquick) {  //uniquick just means swap on uniswap first then quickswap
//             uint256 amountOut = swapOnUniswap(
//                 tokenBalance,
//                 token0,  //input token
//                 token1, //output token
//                 pool2Fee //A different uniswap pool and pool fee tier. Despite being same tokens
//             );


//             finalAmountOut = swapOnQuickswap(
//                 amountOut,
//                 token1,   //input token
//                 token0    //output token
//             );

//             emit TokensSwapped(token0, tokenBalance, finalAmountOut);
//         }

//         if(decoded.unisushi){
//             uint256 amountOut = swapOnUniswap(
//                 tokenBalance,
//                 token0,  //input token
//                 token1, //output token
//                 pool2Fee //A different uniswap pool and pool fee tier. Despite being same tokens
//             );

//                            //From token1 => targetAsset
//             finalAmountOut = startSushiswapV2(token1, amountOut, token0);

//             emit TokensSwapped(token0, tokenBalance, finalAmountOut);
//         }

//         if(decoded.quickuni) {
//             uint256 amountOut = swapOnQuickswap(
//                 tokenBalance,
//                 token0,   //input token
//                 token1   //output token
//             );

//             finalAmountOut = swapOnUniswap(
//                 amountOut,
//                 token1,  //input token
//                 token0,  //output token
//                 pool2Fee
//             );

//             emit TokensSwapped(token0, tokenBalance, finalAmountOut);
//         }

//         if(decoded.quicksushi){
//             uint256 amountOut = swapOnQuickswap(
//                 tokenBalance,
//                 token0,   //input token
//                 token1   //output token
//             );

//                             //From token1 => targetAsset
//             finalAmountOut = startSushiswapV2(token1, amountOut, token0);

//             emit TokensSwapped(token0, tokenBalance, finalAmountOut);
//         }

//         if(decoded.sushiuni){
//             address targetAsset = decoded.token2;
//                            //From token0 => targetAsset
//             uint256 amountOut = startSushiswapV2(token0, tokenBalance, targetAsset);
            
//             finalAmountOut = swapOnUniswap(
//                 amountOut,
//                 targetAsset,  //input token
//                 token0,  //output token
//                 pool2Fee
//             );

//             emit TokensSwapped(token0, tokenBalance, finalAmountOut);

//         }
        
//         if(decoded.sushiquick){
//             address targetAsset = decoded.token2;
//                            //From token0 => targetAsset
//             uint256 amountOut = startSushiswapV2(token0, tokenBalance, targetAsset);

//             finalAmountOut = swapOnQuickswap(
//                 amountOut,
//                 targetAsset,   //input token
//                 token0    //output token
//             );

//             emit TokensSwapped(token0, tokenBalance, finalAmountOut);
//         }

//         payback(decoded.amount1, decoded.amount2, fee0, fee1, token0, token1);
//     }

//     function payback(
//         uint256 amount1,
//         uint256 amount2,
//         uint256 fee0,
//         uint256 fee1,
//         address token0,
//         address token1
//         /* uint256 finalAmountOut,
//         address payer */
//     ) internal {
//         uint256 amount1Owed = LowGasSafeMath.add(amount1, fee0);
//         uint256 amount2Owed = LowGasSafeMath.add(amount2, fee1);

//         TransferHelper.safeApprove(token0, address(this), amount1Owed);
//         TransferHelper.safeApprove(token1, address(this), amount2Owed);

//         // pay back loan to the pool 
//         // note: msg.sender == pool to pay back
//         if (amount1Owed > 0) pay(token0, address(this), msg.sender, amount1Owed);
//         if (amount2Owed > 0) pay(token1, address(this), msg.sender, amount2Owed);

//         // if (finalAmountOut > amount0Owed) {
//         //     uint256 ourProfit = LowGasSafeMath.sub(finalAmountOut, amount1Owed);
//         //     // TransferHelper.safeApprove(token0, address(this), profit1);
//         //     pay(token0, address(this), payer, ourProfit);
//         // }
//     }

//     function swapOnUniswap(
//         uint256 amountIn,
//         address inputToken,
//         address outputToken,
//         uint24 poolFee
//     ) internal returns (uint256 amountOut) {
//         TransferHelper.safeApprove(inputToken, address(uniswapV3Router), amountIn);
        
//             ISwapRouter.ExactInputSingleParams memory params = 
//                 ISwapRouter.ExactInputSingleParams({
//                     tokenIn: inputToken,
//                     tokenOut: outputToken,
//                     fee: poolFee,
//                     recipient: address(this),  //Where the outbound token amount goes to
//                     deadline: block.timestamp + 200,
//                     amountIn: amountIn,
//                     amountOutMinimum: 0,
//                     sqrtPriceLimitX96: 0
//                 });

//         //The call to `exactInputSingle` executes the swap.
//         amountOut = uniswapV3Router.exactInputSingle(params);
        
//     }   

//     function multihopSwapOnUniswap(
//     uint256 amountIn,
//     address inputToken,
//     uint24 pool2Fee,
//     address sharedAddress,
//     uint24 pool3Fee,
//     address outputToken
//     ) internal returns (uint256 amountOut) {
//         TransferHelper.safeApprove(inputToken, address(uniswapV3Router), amountIn);
        
//         // Multiple pool swaps are encoded through bytes called a `path`. A path is a sequence of token addresses and poolFees that define the pools used in the swaps.
//         // The format for pool encoding is (tokenIn, fee, tokenOut/tokenIn, fee, tokenOut) where tokenIn/tokenOut parameter is the shared token across the pools.
//         // Since we are swapping DAI to USDC and then USDC to WETH9 the path encoding is (DAI, 0.3%, USDC, 0.3%, WETH9).
//         ISwapRouter.ExactInputParams memory params = ISwapRouter
//             .ExactInputParams({
//                 path: abi.encodePacked(
//                     inputToken,
//                     pool2Fee,
//                     sharedAddress, //e.g dai to weth to usdc ...Then weth is the shared address
//                     pool3Fee,
//                     outputToken
//                 ),
//                 recipient: address(this),
//                 deadline: block.timestamp + 200,
//                 amountIn: amountIn,
//                 amountOutMinimum: 0
//             });

//         // The call to `exactInput` executes the multihop swap.
//         amountOut = uniswapV3Router.exactInput(params);
        
//     }

//     function swapOnQuickswap(
//         uint256 amountIn,
//         address inputToken,
//         address outputToken
//     ) internal returns (uint256 amountOut) {
//          //+-We allow the router of SushiSwap to spend all our tokens that are neccesary in doing the trade:
//         TransferHelper.safeApprove(inputToken, address(quickRouter), amountIn);

//          //+-Array of the 2 Tokens Addresses:
//         address[] memory path = new address[](2);

//         //+-Defines the Direction of the Trade (From Token0 to Token1 or vice versa):
//         path[0] = inputToken;  //path[0] is the token we want to sell
//         path[1] = outputToken;

//         //+-We Sell in QuickSwap the Tokens we Borrowed 
//         amountOut = quickRouter.swapExactTokensForTokens(
//             amountIn, /**+-Amount of Tokens we are going to Sell.*/
//             0, /**+-Minimum Amount of Tokens that we expect to receive in exchange for our Tokens.*/
//             path, /**+-We tell SushiSwap what Token to Sell and what Token to Buy.*/
//             address(this), /**+-Address of this S.C. where the Output Tokens are going to be received.*/
//             block.timestamp + 200 /**+-Time Limit after which an order will be rejected by SushiSwap(It is mainly useful if you send an Order directly from your wallet).*/
//         )[1];
//     }


//     function startUniswapV3AndQuickSwaps(FlashParams memory params) internal {
//         PoolAddress.PoolKey memory poolKey = PoolAddress.PoolKey({
//             token0: params.token0, //borrow token(This is also the token you borrowed from Aave)
//             token1: params.token1, //A second token
//             fee: params.fee1  //pool fee tier
//         });
        
//         IUniswapV3Pool pool = IUniswapV3Pool(
//             PoolAddress.computeAddress(uniswapV3factory, poolKey) //uses the poolKey to compute/get the pool 
//         );

//         // recipient of borrowed amounts (should be (this) contract)
//         // amount of token0 requested to borrow
//         // amount of token1 requested to borrow
//         // callback data encoded
//         pool.flash(
//             address(this), //recipient address
//             params.amount1, //Amount of token0 borrowed
//             params.amount2,
//             abi.encode(
//                 FlashCallbackData({
//                     amount1: params.amount1,
//                     amount2: params.amount2,
//                     token2: params.token2,
//                     payer: tx.origin,
//                     poolKey: poolKey,
//                     pool2Fee: params.fee2,
//                     pool3Fee: params.fee3,
//                     sharedAddress: params.sharedAddress,
//                     uniuniquick: params.uniuniquick,
//                     uniquick: params.uniquick,
//                     unisushi: params.unisushi,
//                     quickuni: params.quickuni,
//                     quicksushi: params.quicksushi,
//                     sushiuni: params.sushiuni,
//                     sushiquick: params.sushiquick

//                 })
//             )
//         );
//     }

//     // function withdrawToken(
//     //     address token,
//     //     address recipient,
//     //     uint256 value
//     // ) external onlyOwner noReentrant {
//     //     pay(token, address(this), recipient, value);
//     // }
// }
