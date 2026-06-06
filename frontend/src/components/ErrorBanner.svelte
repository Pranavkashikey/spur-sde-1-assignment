<script>
	export let message;
	export let onDismiss;
</script>

<div class="error-banner" role="alert">
	<svg width="16" height="16" viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
		<path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
	</svg>
	<span>{message}</span>
	<button class="dismiss" on:click={onDismiss} aria-label="Dismiss error">
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none">
			<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
		</svg>
	</button>
</div>

<style>
	.error-banner {
		display: flex;
		align-items: center;
		gap: 8px;
		background: rgba(255, 90, 90, 0.08);
		border: 1px solid rgba(255, 90, 90, 0.25);
		color: var(--error);
		padding: 10px 14px;
		border-radius: var(--radius-sm);
		font-size: 0.85rem;
		animation: fadeUp 0.2s ease;
	}

	span {
		flex: 1;
		line-height: 1.4;
	}

	.dismiss {
		background: none;
		border: none;
		color: var(--error);
		cursor: pointer;
		opacity: 0.7;
		padding: 2px;
		display: flex;
		transition: opacity var(--transition);
	}
	.dismiss:hover { opacity: 1; }

	@keyframes fadeUp {
		from { opacity: 0; transform: translateY(4px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
