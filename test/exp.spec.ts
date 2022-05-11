import { expect } from "./setup";
import { Contract, ContractFactory, Signer } from "ethers";
import { ethers } from "hardhat";

describe("exp", () => {
  let signers: Signer[];
  before(async () => {
    signers = await ethers.getSigners();
  });

  let expContract: ContractFactory;
  before(async () => {
    expContract = await ethers.getContractFactory("exp");
  });

  let exp: Contract;
  beforeEach(async () => {
    exp = await expContract.deploy("exp", "EXP", 18);
  });

  /// ------------------------------------------------------------------------
  /// Constructor
  /// ------------------------------------------------------------------------

  describe("constructor", () => {
    describe("when deployed", () => {
      it("should have correct owner", async () => {
        expect(await exp.owner()).to.deep.equal(await signers[0].getAddress());
      });

      it("should have correct name, symbol, decimals", async () => {
        expect([
          await exp.name(),
          await exp.symbol(),
          await exp.decimals(),
        ]).to.deep.equal(["exp", "EXP", 18]);
      });
    });
  });

  /// ------------------------------------------------------------------------
  /// LilOwnable Tests
  /// ------------------------------------------------------------------------

  //function transferOwnership(address _newOwner) external {
  describe("transferOwnership", () => {
    describe("when called by owner", () => {
      it("should change owner", async () => {
        expect(await exp.owner()).to.deep.equal(await signers[0].getAddress());
        exp.transferOwnership(signers[1].getAddress());
        expect(await exp.owner()).to.deep.equal(await signers[1].getAddress());
      });
    });

    describe("when called by non-owner", () => {
      it("should revert with 'NotOwner()'", async () => {
        await expect(
          exp.connect(signers[1]).transferOwnership(signers[1].getAddress())
        ).to.be.revertedWith("NotOwner()");
      });
    });
  });

  //function renounceOwnership() external {
  describe("renounceOwnership", () => {
    describe("when called by owner", () => {
      it("should change owner to address(0)", async () => {
        expect(await exp.owner()).to.deep.equal(await signers[0].getAddress());
        exp.renounceOwnership();
        expect(await exp.owner()).to.deep.equal(
          "0x0000000000000000000000000000000000000000"
        );
      });
    });

    describe("when called by non-owner", () => {
      it("should revert with 'NotOwner()'", async () => {
        await expect(
          exp.connect(signers[1]).renounceOwnership()
        ).to.be.revertedWith("NotOwner()");
      });
    });
  });

  //supportsInterface(bytes4 interfaceId
  describe("supportsInterface", () => {
    describe("when called with ERC173 signature", () => {
      it("should return true", async () => {
        expect(await exp.supportsInterface("0x7f5828d0")).to.equal(true);
      });
    });
  });

  /// ------------------------------------------------------------------------
  /// Basic ERC20 Functionality
  /// ------------------------------------------------------------------------

  //function setApprovedMinter(address _adminAddr, bool _isAdmin) public {
  describe("setApprovedMinter", () => {
    describe("when called by owner to add a tokenAdmin", () => {
      it("should add a tokenAdmin ", async () => {
        expect(await exp.tokenAdmins(await signers[1].getAddress())).to.equal(
          false
        );

        exp.setApprovedMinter(await signers[1].getAddress(), true);

        expect(await exp.tokenAdmins(await signers[1].getAddress())).to.equal(
          true
        );
      });
    });

    describe("when called by owner to remove a tokenAdmin", () => {
      it("should remove the tokenAdmin ", async () => {
        exp.setApprovedMinter(await signers[1].getAddress(), true);
        exp.setApprovedMinter(await signers[2].getAddress(), true);
        expect(await exp.tokenAdmins(await signers[1].getAddress())).to.equal(
          true
        );
        exp.setApprovedMinter(await signers[1].getAddress(), false);
        expect(await exp.tokenAdmins(await signers[1].getAddress())).to.equal(
          false
        );
      });
    });

    describe("when called by non-owner", () => {
      it("should revert with 'NotOwner()'", async () => {
        await expect(
          exp
            .connect(signers[1])
            .setApprovedMinter(await signers[2].getAddress(), true)
        ).to.be.revertedWith("NotOwner()");
      });
    });
  });

  describe("mint", () => {
    describe("when called by tokenAdmin", () => {
      it("should mint tokens", async () => {
        exp.mint(await signers[1].getAddress(), 1000);

        expect(await exp.totalSupply()).to.equal(1000);
        expect(await exp.balanceOf(await signers[1].getAddress())).to.equal(
          1000
        );
      });
    });

    describe("when called by non-tokenAdmin", () => {
      it("should revert with 'NotAuthorized()'", async () => {
        await expect(
          exp.connect(signers[1]).mint(await signers[0].getAddress(), 1000)
        ).to.be.revertedWith("NotAuthorized()");
      });
    });

    describe("being called multiple times to sweep gas cost expectations", () => {
      it("should mint a bunch of tokens", async () => {
        for (let i = 1; i < 10000; i = i + 100) {
          exp.mint(await signers[0].getAddress(), i);
        }
      });
    });
  });

  describe("burn", () => {
    describe("when called by tokenAdmin", () => {
      it("should burn tokens", async () => {
        exp.mint(await signers[1].getAddress(), 1000);
        exp.burn(await signers[1].getAddress(), 500);
        expect(await exp.balanceOf(await signers[1].getAddress())).to.equal(
          500
        );
      });
    });

    describe("when called by owner", () => {
      it("should burn tokens", async () => {
        exp.mint(await signers[1].getAddress(), 1000);
        exp.connect(signers[1]).burn(await signers[1].getAddress(), 600);
        expect(await exp.balanceOf(await signers[1].getAddress())).to.equal(
          400
        );
      });
    });

    describe("when trying to burn more than their balance", () => {
      it("should revert with 'BalanceTooLow()'", async () => {
        exp.mint(await signers[1].getAddress(), 1000);
        await expect(
          exp.connect(signers[1]).burn(await signers[1].getAddress(), 1100)
        ).to.be.revertedWith("BalanceTooLow()");
      });
    });

    describe("when called by non-tokenAdmin  and non-owner", () => {
      it("should revert with 'NotAuthorized()'", async () => {
        exp.mint(await signers[1].getAddress(), 1000);
        await expect(
          exp.connect(signers[2]).burn(await signers[1].getAddress(), 700)
        ).to.be.revertedWith("NotAuthorized()");
      });
    });
  });

  // function approve(address spender, uint256 amount)
  describe("approve", () => {
    describe("when called", () => {
      it("should revert with 'isSoulbound()'", async () => {
        exp.mint(await signers[0].getAddress(), 1000);
        await expect(
          exp.approve(await signers[1].getAddress(), 1000)
        ).to.be.revertedWith("isSoulbound()");
      });
    });
  });

  // function transfer(address to, uint256 amount)
  describe("transfer", () => {
    describe("when called", () => {
      it("should revert with 'isSoulbound()'", async () => {
        exp.mint(await signers[0].getAddress(), 1000);
        await expect(
          exp.transfer(await signers[1].getAddress(), 1000)
        ).to.be.revertedWith("isSoulbound()");
      });
    });
  });

  //    function transferFrom(address from, address to, uint256 amount)
  describe("transferFrom", () => {
    describe("when called", () => {
      it("should revert with 'isSoulbound()'", async () => {
        exp.mint(await signers[0].getAddress(), 1000);
        await expect(
          exp.transferFrom(
            await signers[0].getAddress(),
            await signers[1].getAddress(),
            1000
          )
        ).to.be.revertedWith("isSoulbound()");
      });
    });
  });

  // allowance(address(this), address(0xBEEF))
  describe("allowance", () => {
    describe("when called", () => {
      it("should always return zero'", async () => {
        exp.mint(await signers[0].getAddress(), 1000);
        expect(
          await exp.allowance(
            await signers[0].getAddress(),
            await signers[1].getAddress()
          )
        ).to.equal(0);
      });
    });
  });
});
