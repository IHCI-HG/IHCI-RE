import * as React from 'react';
import { createPortal } from 'react-dom';
import { autobind } from 'core-decorators'

import './confirm.scss'

interface IProps {
    /** 标题 */
    title?: string

    /** 提示内容 */
    content?: React.ReactElement<any> | string
 
    /** 底部按钮，确认按钮、取消按钮、确认+取消按钮 */
    buttons?: 'confirm' | 'cancel' | 'confirm-cancel' | 'cancel-confirm'

    /** 确认按钮文案 默认为确认 */
    confirmText?: string

    /** 取消按钮文案 默认为取消 */
    cancelText?: string

    /** 确认按钮点击 */
    onConfirm?: () => void

    /** 取消按钮点击 */
    onCancel?: () => void
}

@autobind
export default class Confirm extends React.Component<IProps, {}> {
    
    state = {
        show: false,
    }

    /**
     * show dialog
     */
    public show(): void {
        this.setState({
            show: true
        });
    }

    /**
     * hide dialog
     */
    public hide(): void {
        this.setState({
            show: false
        });
    }

    private onCancel() {
        this.hide();
        this.props.onCancel && this.props.onCancel();
    }

    // 生成底部按钮
    private get footerButtons() {
        const confirmText = this.props.confirmText || '确认';
        const cancelText = this.props.cancelText || '取消';
        const confirmBtn = (
            <span 
                key='co-confirm-button'
                className='co-confirm-button' 
                onClick={ this.props.onConfirm }
            >
                { confirmText }
            </span>
        );
        const cancelBtn = (
            <span 
                key='co-cancel-button'
                className='co-cancel-button' 
                onClick={ this.onCancel }
            >
                { cancelText }
            </span>
        );

        switch (this.props.buttons) {
            case 'confirm':
                return confirmBtn
        
            case 'cancel':
                return cancelBtn
            
            case 'confirm-cancel':
                return [
                    confirmBtn,
                    cancelBtn,
                ]
            
            case 'cancel-confirm':
                return [
                    cancelBtn,
                    confirmBtn,
                ]

            default:
                return [
                    cancelBtn,
                    confirmBtn,
                ]
        }
    }

    render() {
        return createPortal(
            <section className={`co-dialog-container ${ this.state.show ? '' : 'hide' }`}>
                <aside className='co-bg' onClick={ this.hide }></aside>

                <main className='co-dialog-main'>
                    {
                        this.props.title &&
                            <header className='co-dialog-title'>{ this.props.title }</header>
                    }
                    {
                        this.props.content &&
                            <span className='co-dialog-content'>{ this.props.content }</span>
                    }
                    { this.props.children }
                    <footer className='co-dialog-footer'>
                        { this.footerButtons }
                    </footer>
                </main>
            </section>,

            document.body
        )
    }

}