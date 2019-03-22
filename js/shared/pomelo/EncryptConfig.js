const Config = {
    'USE_ENCRYPT_PROTOCOL': true,
    'USE_ENCRYPT_REQUEST': true,
    'USE_ENCRYPT_RESPONSE': true,
    'USE_ENCRYPT_PUSH': true,
    'GUESS_KEY': 'kingduel3016',
    'ENCRYPT_INFO': {
        'connector.userHandler.signUpFromWeChat': [
            'js_code',
            'userInfo.nickName',
            'userInfo.city',
            'userInfo.province',
            'userInfo.country',
            'userInfo.avatarUrl',
            'encryptedData',
            'iv',
            'cFrom'
        ],
        'connector.userHandler.signInFromWeChat': [
            'js_code',
            'cFrom'
        ],
        'connector.userHandler.getQRCode': [
            'scene',
            'page'
        ],
        'connector.cashoutHandler.getCashOutHistory': [
            'cFrom'
        ],
        'connector.rankHandler.rankList': [
            'table'
        ],
        'lobby.lobbyHandler.useTrumpet': [
            'detailObject'
        ],
        'connector.championshipHandler.initChampionship': [
            'championshipMode'
        ],
        'connector.championshipHandler.getChampionshipAward': [
            'championshipMode'
        ],
        'connector.championshipHandler.getChampionshipAwardHistory': [
            'championshipMode'
        ],
        'connector.championshipHandler.useChampionshipRevivedCard': [
            'championshipMode'
        ],
        'connector.rankHandler.getLastRankList': [
            'game',
            'sortBy'
        ],
        'connector.rankHandler.getAdjacentRankList': [
            'game',
            'sortBy'
        ],
        'connector.rankHandler.getAllRankList': [
            'game',
            'sortBy'
        ]
    },
    'PUSH_ENCRYPT_INFO': {
        'onReceivedTrumpet': [
            'content',
            'params',
            'detailObject'
        ],
        'onAllPlayersReady': [
            'playerInfoList.nickname',
            'playerInfoList.cardIds',
            'playerInfoList.battleCardGroup'
        ],
        'onGameOver': [
            'fightAreaName'
        ],
        'onMatched': [
            'fightAreaName'
        ],
        'onChat': [
            'content'
        ],
        'onAddedFriend': [
            'friendNickname',
            'friendPortrait'
        ],
        'onReceiveAddFriendInvitation': [
            'inviterNickname'
        ],
        'onReceiveReplyAddFriendInvitation': [
            'inviteeNickname'
        ],
        'onReceiveDeleteUserFriend': [
            'nickname'
        ],
        'onSendPurchaseGoods': [
            'purchaseGoodsInfoString'
        ],
        'onReceiveUnionMsg': [
            'content',
            'options',
            'detail'
        ]
    }
};

export default Config;
