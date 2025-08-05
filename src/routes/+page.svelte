<script>
	// Library Imports
	import { base } from '$app/paths';
	import { setScene, updateProjects } from '$lib/ThreeObject.js';
	import { fade } from "svelte/transition";
	import { onMount } from 'svelte';
	
	// Import components (you'll need to create these)
	import HeroSection from '$lib/components/HeroSection.svelte';
	import SocialBubbles from '$lib/components/SocialBubbles.svelte';
	import ProjectsSection from '$lib/components/ProjectsSection.svelte';
	import BiographicalSection from '$lib/components/BiographicalSection.svelte';
	
	// 🚀 Ta zmienna przychodzi z load()
	export let data; // SvelteKit domyślnie przekazuje `data` z load()
	const portfolioData = data.portfolioData;

	// Create a new wavy sphere scene
	let ThreeObject;
	
	// Project data
	let personalData = {};
	let musicProjects = [];
	let programmingProjects = [];

	// Scroll tracking for text animation
	let scrollY = 0;
	let innerHeight = 0;
	let innerWidth = 0;
	
	// Background brightness detection for text readability
	let backgroundBrightness = 0.5; // Default middle brightness
	let adaptiveTextClass = 'text-white';
	let adaptiveSubTextClass = 'text-gray-300';

	// Breakpoint for bio visibility
	$: showBio = innerWidth >= 1300; // Show bio only on xl screens and larger
	$: projectsHeight = 0;
	
	// Function to sample canvas brightness
	function sampleCanvasBrightness() {
		if (!ThreeObject) return;
		
		try {
			const canvas = ThreeObject;
			const ctx = canvas.getContext('2d', { willReadFrequently: true });
			if (!ctx) return;
			
			// Sample multiple points across the canvas
			const samplePoints = [
				{ x: canvas.width * 0.2, y: canvas.height * 0.3 },
				{ x: canvas.width * 0.5, y: canvas.height * 0.5 },
				{ x: canvas.width * 0.8, y: canvas.height * 0.7 },
				{ x: canvas.width * 0.3, y: canvas.height * 0.8 },
				{ x: canvas.width * 0.7, y: canvas.height * 0.2 }
			];
			
			let totalBrightness = 0;
			let validSamples = 0;
			
			samplePoints.forEach(point => {
				try {
					const imageData = ctx.getImageData(point.x, point.y, 1, 1);
					const [r, g, b] = imageData.data;
					// Calculate relative luminance
					const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
					totalBrightness += brightness;
					validSamples++;
				} catch (e) {
					// Skip invalid samples
				}
			});
			
			if (validSamples > 0) {
				backgroundBrightness = totalBrightness / validSamples;
				
				// Update text classes based on brightness
				if (backgroundBrightness > 0.6) {
					// Bright background - use dark text
					adaptiveTextClass = 'text-gray-900';
					adaptiveSubTextClass = 'text-gray-700';
				} else if (backgroundBrightness > 0.4) {
					// Medium background - use high contrast
					adaptiveTextClass = 'text-white';
					adaptiveSubTextClass = 'text-gray-200';
				} else {
					// Dark background - use light text
					adaptiveTextClass = 'text-white';
					adaptiveSubTextClass = 'text-gray-300';
				}
			}
		} catch (error) {
			// Fallback to default colors
			adaptiveTextClass = 'text-white';
			adaptiveSubTextClass = 'text-gray-300';
		}
	}

	// Sample brightness periodically
	let brightnessInterval;
	
	onMount(async () => {
        await setScene(ThreeObject)
		
        // Fetch data from the static directory using the correct path
        // ✅ portfolioData już jest z `load()`, nie fetchuj go ponownie
		if (portfolioData) {
			personalData = portfolioData.personal;
			musicProjects = portfolioData.musicProjects;
			programmingProjects = portfolioData.programmingProjects;

			updateProjects(musicProjects, programmingProjects);
			brightnessInterval = setInterval(sampleCanvasBrightness, 200);
		} else {
			console.error('Brak danych portfolio');
		}
		
		return () => {
			if (brightnessInterval) {
				clearInterval(brightnessInterval);
			}
		};
    });
</script>

<svelte:window bind:scrollY bind:innerHeight bind:innerWidth />

<canvas bind:this={ThreeObject} style="top: 0px; right: 20px; z-index: -1; position: fixed; pointer-events: auto;"></canvas>

<SocialBubbles />

<!-- Seamless flowing content -->
<div class="seamless-flow">
	<HeroSection 
		{personalData} 
		{adaptiveTextClass} 
		{adaptiveSubTextClass} 
	/>

	<!-- Projects naturally flowing from bottom of page with biographical text -->
	<div class="projects-flow relative">
		<!-- Main content container -->
		<div class="flex gap-8 xl:gap-16 2xl:gap-24">
			<!-- Left side - Projects -->
			<div 
				class={`projects-container flex-1 ${showBio ? 'xl:w-1/2' : ''}`}
				bind:clientHeight={projectsHeight}
				>
				<ProjectsSection 
					{musicProjects}
					{programmingProjects}
					{adaptiveTextClass}
					{adaptiveSubTextClass}
				/>
			</div>

			<!-- Right side - Biographical text (responsive visibility) -->
			{#if showBio}
				<div class="biographical-text xl:w-1/2 2xl:w-2/3">
					<BiographicalSection 
						{scrollY}
						{innerHeight}
						{projectsHeight}
						{adaptiveTextClass}
						{adaptiveSubTextClass}
					/>
				</div>
			{/if}
		</div>

		<!-- Fade to black at the very bottom -->
		<div class="h-40 bg-gradient-to-b from-transparent to-black/80"></div>
	</div>
</div>

<style>
	/* Smooth scrolling */
	html {
		scroll-behavior: smooth;
	}

	/* Seamless flow container */
	.seamless-flow {
		background: transparent;
		position: relative;
	}

	/* Projects flow seamlessly */
	.projects-flow {
		background: transparent;
		position: relative;
		z-index: 1;
	}

	/* Responsive adjustments for mobile */
	@media (max-width: 768px) {
		.projects-container {
			padding: 0 1rem;
		}
	}

	/* Large screen adjustments */
	@media (min-width: 1280px) {
		.projects-container {
			padding-right: 2rem;
		}
	}

	/* Text selection styling */
	::selection {
		background-color: #FF0080;
		color: white;
	}

	/* Remove any visual separations */
	* {
		border: none;
		outline: none;
	}
</style>