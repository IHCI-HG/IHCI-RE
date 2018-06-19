var qlCommon = {

	//转换展示时间
	convertSecond :function(sec){
		var second = Number(sec);
		if (second <= 60)
		{
			return String(second+'″'); 
		}
		var min = Math.floor(second / 60);
		var sec = second % 60;

		var secondStr = min + '′' + sec + '″';
		return secondStr;
	},

	//检查时间小于2位数
	checkTime:function (i) {
		if (i < 10) {
			i = "0" + i;
		}
		return i;
	},

	//过滤特殊符号
	normalFilter:function (sf) {
		var sfData = sf;
		sfData = sfData.replace(/(\u0085)|(\u2028)|(\u2029)/g, "");
		sfData = sfData.replace(/\%/g, "%25");
		sfData = sfData.replace(/\+/g, "%2B");
		sfData = sfData.replace(/\#/g, "%23");
		sfData = sfData.replace(/\//g, "%2F");
		sfData = sfData.replace(/\?/g, "%3F");
		sfData = sfData.replace(/\=/g, "%3D");
		sfData = sfData.replace(/\</g, "&lt;");
		sfData = sfData.replace(/\>/g, "&gt;");
		sfData = sfData.replace(/\&/g, "%26");
		return sfData;
	},
	symbolFilter:function (sf) {
		var sfData = sf;
		sfData = sfData.replace(/\n|\r|(\r\n)|(\u0085)|(\u2028)|(\u2029)/g, "");
		sfData = normalFilter(sfData);
		return sfData;
	},
	firstFilter:function (ff) {
		var ffData = ff;
		ffData = ffData.replace(/\"/g, "&quot;");
		ffData = ffData.replace(/\'/g, "&#39;");
		ffData = ffData.replace(/\\/g, "\\\\");
		return ffData;
	},
	wordFilter:function (ff) {
		var ffData = ff;
		ffData = ffData.replace(/\</g, "&lt;");
		ffData = ffData.replace(/\>/g, "&gt;");
		ffData = ffData.replace(/\"/g, "&quot;");
		ffData = ffData.replace(/\'/g, "&#39;");
		return ffData;
	},
	postBackFilter:function (pbf) {
		var pbfData = pbf;
		pbfData = pbfData.replace(/(\%26lt;br\%26gt;)/g, "\<br\>");
		return pbfData;
	},


	/**
	 * 数组去重
	 * 
	 * @param {array<number|string|boolean>} arr 待去重的数组
	 * @returns {array<number|string|boolean>} 去重后的数组
	 */
	noRepeatArray:function  (arr) {
		var len = arr.length;

		return arr.filter(function(item, index) {
			for (var i = index+1; i < len; i++) {
				if (arr[i] === item) {
					return false;
				}
			}

			return true;
		});
	},

	/**
	 * 判断数组中是否有当前元素，
	 * 
	 * @param {Array<number|string|boolean>} arr 待对比数组
	 * @param {number|string|boolean} tag 待对比数据
	 * @returns
	 */
	isContained:function (arr, tag) {
		return arr.some(function(item) {
			return item === tag;
		});
	},



	//临时使用旧弹框
	qlSlBoxShow:function (qlSlBox) {
		$(qlSlBox).show();
		setTimeout(function(){
			var boxH = $(qlSlBox).find(".main").outerHeight();
			if (boxH <= document.body.clientHeight - 45) {
				$(qlSlBox).removeClass("qMS");
				$(qlSlBox).find(".main").css({ "marginTop": "-" + ((boxH / 2 + 15).toFixed(0)) + "px" });
				if ($(".qlMTBg").length > 0) {
					$(".qlMTBg").css({ "height": "100%" });
				};
			} else {
				$(qlSlBox).addClass("qMS");
				$(qlSlBox).find(".main").css({ "marginTop": "0px" });
				if ($(".qlMTBg").length > 0) {
					$(".qlMTBg").css({ "height": (boxH + 30) + "px" });
				};
			};
		},300);
	}


}
module.exports = qlCommon;
