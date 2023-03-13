import React from 'react';
import 'pixi-spine';
import * as PIXI from 'pixi.js';
import { Spine } from 'pixi-spine';

export class Chatbot extends React.Component {
	constructor(props) {
		super(props);
	}
	componentDidMount() {
		let spineDiv = document.getElementById("spine");
		this.app = new PIXI.Application();
		let size = 200;
		this.app.renderer = new PIXI.Renderer({ width: size, height: size, backgroundAlpha: 0 });
		spineDiv.innerHTML = '';
		spineDiv.appendChild(this.app.view);
		this.app.stage.hitArea = new PIXI.Rectangle(0, 0, size, size);
		this.app.stage.interactive = true;
		this.app.stage.on('pointerdown', (event) => {
						this.mouseDown = true;
						this.animation.state.setAnimation(1, 'amazed', true);
					})
					.on('pointerup', (event) => {
						this.mouseDown = false;
						this.animation.state.setAnimation(1, 'happy', true);
						this.right.alpha = 0;
						this.left.alpha = 0;
						this.top.alpha = 0;
						this.bottom.alpha = 0;
						this.animation.skeleton.setToSetupPose()
					})
					.on('pointerupoutside',  (event) => {
						this.mouseDown = false;
						this.animation.state.setAnimation(1, 'happy', true);
						this.right.alpha = 0;
						this.left.alpha = 0;
						this.top.alpha = 0;
						this.bottom.alpha = 0;
						this.animation.skeleton.setToSetupPose()
					})
					.on('pointermove', (event) => {
						if (this.mouseDown) {
							let pos = event.data.global;
							let x = (size - pos.x) / size*2, y = (size - pos.y) / size*2;
							this.right.alpha = x < 1 ? 1 - x : 0;
							this.left.alpha = x > 1 ? x - 1 : 0;
							this.top.alpha = y > 1 ? y - 1 : 0;
							this.bottom.alpha = y < 1 ? 1 - y : 0;
							this.animation.skeleton.setToSetupPose()
						}
					});
		let that = this
		PIXI.Assets.load("assets/Chatbot.skel").then((resource) => {
			that.animation = new Spine(resource.spineData);
			this.app.stage.addChild(that.animation);
			that.animation.position.x = size / 2;
			that.animation.position.y = size / 2;
			that.animation.scale.x = that.animation.scale.y = size / 1000;

			let state = this.animation.state;
			state.setAnimation(0, "idle", true);
			state.setAnimation(1, "happy", true);
			this.left = state.setAnimation(2, "left", true);
			this.right = state.setAnimation(3, "right", true);
			this.top = state.setAnimation(4, "top", true);
			this.bottom = state.setAnimation(5, "bottom", true);
			this.right.alpha = 0;
			this.left.alpha = 0;
			this.top.alpha = 0;
			this.bottom.alpha = 0;
		});
	}
	render() {
		return (null);
	}
};