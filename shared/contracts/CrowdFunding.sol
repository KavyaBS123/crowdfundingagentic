// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract CrowdFunding {
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        string image;

        address[] donators;
        uint256[] donations;
        string category;
    }

    mapping(uint256 => Campaign) public campaigns;

    uint256 public numberOfCampaigns = 0;

    function createCampaign(
        address _owner,
        string memory _title, 
        string memory _description, 
        uint256 _target,
        uint256 _deadline,
        string memory _image,
        string memory _category
    ) public returns (uint256) {
        Campaign storage campaign = campaigns[numberOfCampaigns];

        // Check if deadline is in the future
        require(_deadline > block.timestamp, "The deadline should be a date in the future.");

        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.image = _image;
        campaign.category = _category;

        numberOfCampaigns++;

        return numberOfCampaigns - 1;
    }

    function donateToCampaign(uint256 _id) public payable {
        uint256 amount = msg.value;

        Campaign storage campaign = campaigns[_id];

        campaign.donators.push(msg.sender);
        campaign.donations.push(amount);

        (bool sent,) = payable(campaign.owner).call{value: amount}("");

        if(sent) {
            campaign.amountCollected = campaign.amountCollected + amount;
        }
    }

    function getDonators(uint256 _id) view public returns (address[] memory, uint256[] memory) {
        return (campaigns[_id].donators, campaigns[_id].donations);
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        Campaign[] memory allCampaigns = new Campaign[](numberOfCampaigns);

        for(uint i = 0; i < numberOfCampaigns; i++) {
            Campaign storage item = campaigns[i];

            allCampaigns[i] = item;
        }
        return allCampaigns;
    }

    function getCampaign(uint256 _id) public view returns (Campaign memory) {
        return campaigns[_id];
    }

    function getBadgeForStreak(streak: number): string {
        if (streak >= 30) return 'Custom Governance';
        if (streak >= 14) return 'Voting Rights NFT';
        if (streak >= 7) return 'Gold Badge NFT';
        if (streak >= 3) return 'Silver Badge NFT';
        if (streak >= 1) return 'Bronze Badge NFT';
        return '';
    }
}
