<div class="typing-wrap">
	<div class="avatar">
		<svg width="18" height="18" viewBox="0 0 24 24" fill="none">
			<path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z" fill="currentColor" opacity="0.9"/>
		</svg>
	</div>
	<div class="bubble">
		<span class="dot" style="animation-delay: 0ms" />
		<span class="dot" style="animation-delay: 160ms" />
		<span class="dot" style="animation-delay: 320ms" />
	</div>
</div>

<style>
	.typing-wrap {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		align-self: flex-start;
		animation: fadeUp 0.22s ease both;
	}

	.avatar {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: var(--accent-dim);
		color: var(--accent);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		border: 1px solid var(--accent-glow);
	}

	.bubble {
		background: var(--ai-bubble);
		border: 1px solid var(--border-subtle);
		padding: 12px 16px;
		border-radius: var(--radius);
		border-bottom-left-radius: var(--radius-xs);
		display: flex;
		align-items: center;
		gap: 5px;
	}

	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent);
		display: block;
		animation: bounce 0.9s ease-in-out infinite;
		opacity: 0.7;
	}

	@keyframes bounce {
		0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
		40% { transform: translateY(-5px); opacity: 1; }
	}

	@keyframes fadeUp {
		from { opacity: 0; transform: translateY(6px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
