// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DonorXP is ERC1155, Ownable {
    // Constants
    uint256 public constant BASE_XP_MULTIPLIER = 100;
    uint256 public constant STREAK_BONUS_MULTIPLIER = 10;
    uint256 public constant STREAK_WINDOW = 48 hours;

    // XP thresholds
    uint256 public constant LEVEL_2_THRESHOLD = 100;
    uint256 public constant LEVEL_3_THRESHOLD = 300;
    uint256 public constant LEVEL_4_THRESHOLD = 600;

    // Badge IDs
    uint256 public constant WELCOME_BADGE_ID = 0;
    uint256 public constant BRONZE_BADGE_ID = 1;
    uint256 public constant SILVER_BADGE_ID = 2;
    uint256 public constant GOLD_BADGE_ID = 3;
    uint256 public constant GOVERNANCE_BADGE_ID = 4;

    struct DonorData {
        uint256 xp;
        uint256 lastDonationTime;
        uint256 streakCount;
        uint256 currentLevel;
        bool hasWelcomeBadge;
        uint256[] streakHistory;
    }

    mapping(address => DonorData) private donors;
    mapping(uint256 => string) private badgeURIs;

    event DonationMade(address indexed donor, uint256 amount, uint256 xpEarned);
    event LevelUp(address indexed donor, uint256 newLevel);
    event BadgeMinted(address indexed donor, uint256 badgeId);
    event StreakUpdated(address indexed donor, uint256 newStreakCount);

    constructor() ERC1155("") Ownable(msg.sender) {
        badgeURIs[WELCOME_BADGE_ID] = "ipfs://welcome-badge-uri";
        badgeURIs[BRONZE_BADGE_ID] = "ipfs://bronze-badge-uri";
        badgeURIs[SILVER_BADGE_ID] = "ipfs://silver-badge-uri";
        badgeURIs[GOLD_BADGE_ID] = "ipfs://gold-badge-uri";
        badgeURIs[GOVERNANCE_BADGE_ID] = "ipfs://governance-badge-uri";
    }

    function donate() external payable {
        require(msg.value > 0, "Donation must be > 0");

        DonorData storage donor = donors[msg.sender];

        // Check streak before updating timestamp
        bool isWithinStreakWindow = (block.timestamp - donor.lastDonationTime <= STREAK_WINDOW);
        donor.lastDonationTime = block.timestamp;
        donor.streakCount = isWithinStreakWindow ? donor.streakCount + 1 : 1;
        emit StreakUpdated(msg.sender, donor.streakCount);

        uint256 xpEarned = calculateXP(msg.value, donor.streakCount);
        donor.xp += xpEarned;

        // Update level and mint badge if upgraded
        uint256 newLevel = calculateLevel(donor.xp);
        if (newLevel > donor.currentLevel) {
            donor.currentLevel = newLevel;
            _mintLevelBadge(msg.sender, newLevel);
            emit LevelUp(msg.sender, newLevel);
        }

        // Maintain rolling 7-day streak history
        if (donor.streakHistory.length < 7) {
            donor.streakHistory.push(1);
        } else {
            for (uint256 i = 6; i > 0; i--) {
                donor.streakHistory[i] = donor.streakHistory[i - 1];
            }
            donor.streakHistory[0] = 1;
        }

        emit DonationMade(msg.sender, msg.value, xpEarned);
    }

    function claimWelcomeBadge() external {
        DonorData storage donor = donors[msg.sender];
        require(!donor.hasWelcomeBadge, "Already claimed");
        donor.hasWelcomeBadge = true;
        _mint(msg.sender, WELCOME_BADGE_ID, 1, "");
        emit BadgeMinted(msg.sender, WELCOME_BADGE_ID);
    }

    function calculateXP(uint256 amount, uint256 streakCount) public pure returns (uint256) {
        return (amoun
