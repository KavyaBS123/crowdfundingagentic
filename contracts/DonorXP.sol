// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DonorXP is ERC1155, Ownable {
    using Counters for Counters.Counter;
    
    // Constants
    uint256 public constant BASE_XP_MULTIPLIER = 100;
    uint256 public constant STREAK_BONUS_MULTIPLIER = 10;
    uint256 public constant STREAK_WINDOW = 48 hours;
    
    // XP thresholds for levels
    uint256 public constant LEVEL_2_THRESHOLD = 100;
    uint256 public constant LEVEL_3_THRESHOLD = 300;
    uint256 public constant LEVEL_4_THRESHOLD = 600;
    
    // Badge IDs
    uint256 public constant WELCOME_BADGE_ID = 0;
    uint256 public constant BRONZE_BADGE_ID = 1;
    uint256 public constant SILVER_BADGE_ID = 2;
    uint256 public constant GOLD_BADGE_ID = 3;
    uint256 public constant GOVERNANCE_BADGE_ID = 4;
    
    // Donor data structure
    struct DonorData {
        uint256 xp;
        uint256 lastDonationTime;
        uint256 streakCount;
        uint256 currentLevel;
        bool hasWelcomeBadge;
        uint256[] streakHistory;
    }
    
    // Mappings
    mapping(address => DonorData) public donors;
    mapping(uint256 => string) public badgeURIs;
    
    // Events
    event DonationMade(address indexed donor, uint256 amount, uint256 xpEarned);
    event LevelUp(address indexed donor, uint256 newLevel);
    event BadgeMinted(address indexed donor, uint256 badgeId);
    event StreakUpdated(address indexed donor, uint256 newStreakCount);
    
    constructor() ERC1155("") Ownable(msg.sender) {
        // Set badge URIs
        badgeURIs[WELCOME_BADGE_ID] = "ipfs://welcome-badge-uri";
        badgeURIs[BRONZE_BADGE_ID] = "ipfs://bronze-badge-uri";
        badgeURIs[SILVER_BADGE_ID] = "ipfs://silver-badge-uri";
        badgeURIs[GOLD_BADGE_ID] = "ipfs://gold-badge-uri";
        badgeURIs[GOVERNANCE_BADGE_ID] = "ipfs://governance-badge-uri";
    }
    
    // Function to donate ETH and earn XP
    function donate() external payable {
        require(msg.value > 0, "Donation amount must be greater than 0");
        
        DonorData storage donor = donors[msg.sender];
        uint256 xpEarned = calculateXP(msg.value, donor.streakCount);
        
        // Update donor data
        donor.xp += xpEarned;
        donor.lastDonationTime = block.timestamp;
        
        // Update streak
        if (block.timestamp - donor.lastDonationTime <= STREAK_WINDOW) {
            donor.streakCount++;
            emit StreakUpdated(msg.sender, donor.streakCount);
        } else {
            donor.streakCount = 1;
            emit StreakUpdated(msg.sender, 1);
        }
        
        // Check for level up
        uint256 newLevel = calculateLevel(donor.xp);
        if (newLevel > donor.currentLevel) {
            donor.currentLevel = newLevel;
            mintLevelBadge(msg.sender, newLevel);
            emit LevelUp(msg.sender, newLevel);
        }
        
        // Update streak history
        if (donor.streakHistory.length < 7) {
            donor.streakHistory.push(1);
        } else {
            donor.streakHistory = [1, ...donor.streakHistory.slice(0, 6)];
        }
        
        emit DonationMade(msg.sender, msg.value, xpEarned);
    }
    
    // Function to claim welcome badge
    function claimWelcomeBadge() external {
        require(!donors[msg.sender].hasWelcomeBadge, "Welcome badge already claimed");
        
        donors[msg.sender].hasWelcomeBadge = true;
        _mint(msg.sender, WELCOME_BADGE_ID, 1, "");
        emit BadgeMinted(msg.sender, WELCOME_BADGE_ID);
    }
    
    // Function to calculate XP earned
    function calculateXP(uint256 amount, uint256 streakCount) public pure returns (uint256) {
        uint256 baseXP = amount * BASE_XP_MULTIPLIER;
        uint256 streakBonus = streakCount * STREAK_BONUS_MULTIPLIER;
        return baseXP + streakBonus;
    }
    
    // Function to calculate level based on XP
    function calculateLevel(uint256 xp) public pure returns (uint256) {
        if (xp >= LEVEL_4_THRESHOLD) return 4;
        if (xp >= LEVEL_3_THRESHOLD) return 3;
        if (xp >= LEVEL_2_THRESHOLD) return 2;
        return 1;
    }
    
    // Function to mint badge based on level
    function mintLevelBadge(address donor, uint256 level) internal {
        uint256 badgeId;
        if (level == 2) badgeId = SILVER_BADGE_ID;
        else if (level == 3) badgeId = GOLD_BADGE_ID;
        else if (level == 4) badgeId = GOVERNANCE_BADGE_ID;
        else return;
        
        _mint(donor, badgeId, 1, "");
        emit BadgeMinted(donor, badgeId);
    }
    
    // Function to get donor data
    function getDonorData(address donor) external view returns (
        uint256 xp,
        uint256 lastDonationTime,
        uint256 streakCount,
        uint256 currentLevel,
        bool hasWelcomeBadge,
        uint256[] memory streakHistory
    ) {
        DonorData storage data = donors[donor];
        return (
            data.xp,
            data.lastDonationTime,
            data.streakCount,
            data.currentLevel,
            data.hasWelcomeBadge,
            data.streakHistory
        );
    }
    
    // Function to update badge URIs (only owner)
    function setBadgeURI(uint256 badgeId, string memory uri) external onlyOwner {
        badgeURIs[badgeId] = uri;
    }
    
    // Function to withdraw contract balance (only owner)
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    // Override uri function to return badge URIs
    function uri(uint256 badgeId) public view override returns (string memory) {
        return badgeURIs[badgeId];
    }
} 