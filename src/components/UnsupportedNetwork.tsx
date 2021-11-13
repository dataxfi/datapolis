function UnsupportedNetwork() {
  return (
    <div
      className="w-full h-screen flex flex-col justify-center items-center text-center"
    >
      <div className="lg:p-40 py-10 px-3 md:py-20 md:px-10 bg-primary-900 rounded-xl opacity-70">
        <h2 className="text-center font-bold text-lg">
          ⚠ DataX is not yet deployed to this chain.
        </h2>
        <p className="mt-3 mb-1">Please connect to a supported network.</p>
        <p>(Ethereum Mainnet, Polygon, Rinkeby, BSC)</p>
      </div>
    </div>
  );
}

export default UnsupportedNetwork;
