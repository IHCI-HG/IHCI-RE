// splitChunks naming in webpack 4. It makes common chunks for several chunks and names them as chun1~chunk2
// This plugin add those splitChunks to HtmlWebpackPlugin chunks.

class HtmlAdditionalChunksPlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.done.tap('HelloWorldPlugin', () => {
            console.log('Hello World!');
            console.log(this.options);
        });
    }
}

module.exports = HtmlAdditionalChunksPlugin