function UnsupportedNetwork() {
  return (
    <div className="w-full h-screen flex-col flex justify-center items-center text-center px-3">
      <div className="lg:p-40 py-10 px-3 md:py-20 md:px-10 bg-primary-900 rounded-xl opacity-70">
        <h2 className="text-center font-bold text-lg">This chain will be supported soon!</h2>
        <p className="mt-3 mb-1">For now, please connect to Polygon.</p>
        {/* <p>(Ethereum Mainnet, Polygon, Rinkeby, BSC, Moonriver, Energyweb)</p> */}
      </div>
    </div>
  );
}

export default UnsupportedNetwork;
