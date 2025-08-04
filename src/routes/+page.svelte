<script>
	// Library Imports
	import { base } from '$app/paths';
	import { setScene, updateProjects } from '$lib/ThreeObject.js';
	import { fade } from "svelte/transition";
	import { onMount } from 'svelte';

	// Create a new wavy sphere scene
	let ThreeObject;

	// Project data
	let personalData = {};
	let musicProjects = [];
	let programmingProjects = [];

	// On Page Mount
    onMount(async () => {
        await setScene(ThreeObject)
        
        // Fetch data from the static directory using the correct path
        try {
            const response = await fetch(`${base}/portfolio.json`);
            const portfolioData = await response.json();
            
            // Assign data to respective variables
            personalData = portfolioData.personal;
            musicProjects = portfolioData.musicProjects;
            programmingProjects = portfolioData.programmingProjects;

            // Update the 3D scene with project data
            updateProjects(musicProjects, programmingProjects);

        } catch (error) {
            console.error('Failed to fetch portfolio data:', error);
        }
    });
</script>

<canvas bind:this={ThreeObject} style="top: 0px; right: 20px; z-index: -1; position: fixed; pointer-events: auto;"/>

<!-- Social Media Bubbles -->
<div class="social-bubbles fixed top-8 right-8 z-20 flex flex-col gap-4">
	<a href="https://www.youtube.com/@pawo161" target="_blank" rel="noopener noreferrer" 
	   class="social-bubble youtube" title="YouTube">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
			<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
		</svg>
	</a>
	
	<a href="https://www.instagram.com/pawel_knorps/" target="_blank" rel="noopener noreferrer" 
	   class="social-bubble instagram" title="Instagram">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
			<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
		</svg>
	</a>
	
	<a href="https://www.facebook.com/pawo161/" target="_blank" rel="noopener noreferrer" 
	   class="social-bubble facebook" title="Facebook">
		<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
			<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
		</svg>
	</a>
</div>

<!-- Floating instruction for 3D interaction -->
<!-- <div class="fixed top-1/2 left-8 transform -translate-y-1/2 z-10 pointer-events-none">
	<div class="instruction-bubble">
		<div class="text-white text-sm font-thin tracking-wider opacity-70">
			<div class="mb-2">Click the floating</div>
			<div class="text-[#FF0080] font-bold">pink dots</div>
			<div class="mt-2">to explore projects</div>
		</div>
	</div>
</div> -->

<!-- Seamless flowing content -->
<div class="seamless-flow">
	<!-- Hero Section -->
	<div class="hero-section h-[75vh] flex flex-col justify-center relative">
		<div class="group z-10">
			<h2 class="text-white text-6xl font-black tracking-widest ml-20">{personalData.name}</h2>
			<h2 class="text-white text-2xl font-thin tracking-widest mt-6 ml-20">&nbsp;{personalData.title} and <mark id="revelation" style="background: none; color: #FF0080;" class="font-black">guitarist.</mark></h2>
			<h2 class="text-white text-2xl font-thin tracking-widest mt-6 ml-20">&nbsp;{personalData.bio}</h2>
		</div>
	</div>

	<!-- Projects naturally flowing from bottom of page -->
	<div class="projects-flow">
		<!-- Music Projects -->
		{#if musicProjects.length > 0}
			<div class="project-group ml-24 mb-32">
				<h3 class="text-white text-3xl font-black tracking-widest mb-16 opacity-80">
					<mark style="background: none;" class="text-[#FF0080]">//</mark> MUSIC
				</h3>
				{#each musicProjects as data, i}
					<div id="music-{i}" class="group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out mr-10 w-[20rem] md:w-[40rem] 2xl:w-[50rem] project-card" in:fade={{ delay: 250 * i, duration: 1000 }}>
						{#if data.links}
							<a
								href={data.links.youtube || data.links.bandcamp || data.links.soundcloud || data.links.facebook}
								rel="noopener noreferrer"
								target="_blank"
								class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
								>
								<h2 class="text-white text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300">
									<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
								</h2>
								<h2 class="text-gray-300 text-md font-base mb-6 leading-relaxed">{data.description}</h2>
								<div class="flex flex-wrap gap-3">
									{#if data.features}
										{#each data.features as feature}
											<span class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200">{feature}</span>
										{/each}
									{/if}
								</div>
							</a>
						{:else}
							<div class="h-auto px-0 py-0 tracking-widest">
								<h2 class="text-white text-xl font-black mb-4">
									<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
								</h2>
								<h2 class="text-gray-300 text-md font-base mb-6 leading-relaxed">{data.description}</h2>
								<div class="flex flex-wrap gap-3">
									{#if data.features}
										{#each data.features as feature}
											<span class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full">{feature}</span>
										{/each}
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Programming Projects -->
		{#if programmingProjects.length > 0}
			<div class="project-group ml-24 mb-32">
				<h3 class="text-white text-3xl font-black tracking-widest mb-16 opacity-80">
					<mark style="background: none;" class="text-[#FF0080]">//</mark> CODE
				</h3>
				{#each programmingProjects as data, i}
					<div id="programming-{i}" class="group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out mr-10 w-[20rem] md:w-[40rem] 2xl:w-[50rem] project-card" in:fade={{ delay: 250 * (i + musicProjects.length), duration: 1000 }}>
						{#if data.github || data.demo}
							<a href={data.github || data.demo} rel="noopener noreferrer" target="_blank" class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer">
								<h2 class="text-white text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300">
									<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
								</h2>
								<h2 class="text-gray-300 text-md font-base mb-6 leading-relaxed">{data.description}</h2>
								<div class="flex flex-wrap gap-3">
									{#if data.technologies}
										{#each data.technologies as topic}
											<span class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full transform hover:skew-x-3 transition-transform duration-200">{topic}</span>
										{/each}
									{/if}
								</div>
							</a>
						{:else}
							<div class="h-auto px-0 py-0 tracking-widest">
								<h2 class="text-white text-xl font-black mb-4">
									<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
								</h2>
								<h2 class="text-gray-300 text-md font-base mb-6 leading-relaxed">{data.description}</h2>
								<div class="flex flex-wrap gap-3">
									{#if data.technologies}
										{#each data.technologies as topic}
											<span class="text-[0.65rem] text-[#FF0080] tracking-widest uppercase font-semibold border border-[#FF0080]/30 px-3 py-1 rounded-full">{topic}</span>
										{/each}
									{/if}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<!-- Fade to black at the very bottom -->
		<div class="h-40 bg-gradient-to-b from-transparent to-black/80"></div>
	</div>
</div>

<style>
	#revelation { animation: rainbow 6s infinite; }
	@keyframes rainbow {
		0% 		{color: #FF0080}
		15% 	{color: #FF00AA}
		30% 	{color: #FF00EA}
		45% 	{color: #EA00FF}
		60% 	{color: #FF00C8}
		75% 	{color: #FF009D}
		100% 	{color: #FF008C}
	}

	/* Smooth scrolling */
	html {
		scroll-behavior: smooth;
	}

	/* Seamless flow container */
	.seamless-flow {
		background: transparent;
		position: relative;
	}

	/* Hero section styling */
	.hero-section {
		background: transparent;
	}

	/* Projects flow seamlessly */
	.projects-flow {
		background: transparent;
		position: relative;
		z-index: 1;
	}

	.project-group {
		background: transparent;
	}

	/* Enhanced project interactions */
	.project-group .group:hover {
		transform: translateY(-2rem) scale(1.02);
	}

	/* Project card highlight animation */
	.project-card {
		transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 12px;
		padding: 1rem;
		position: relative;
	}

	.project-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, rgba(255, 0, 128, 0.1), transparent);
		border-radius: 12px;
		opacity: 0;
		transition: opacity 0.3s ease;
		z-index: -1;
	}

	.project-card:hover::before {
		opacity: 1;
	}

	/* Instruction bubble */
	.instruction-bubble {
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 0, 128, 0.2);
		border-radius: 12px;
		padding: 1rem 1.5rem;
		animation: pulse-glow 3s ease-in-out infinite;
	}

	@keyframes pulse-glow {
		0%, 100% {
			box-shadow: 0 0 20px rgba(255, 0, 128, 0.3);
			transform: scale(1);
		}
		50% {
			box-shadow: 0 0 30px rgba(255, 0, 128, 0.5);
			transform: scale(1.02);
		}
	}

	/* Social Media Bubbles */
	.social-bubbles {
		animation: float 3s ease-in-out infinite;
	}

	.social-bubble {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.2);
		color: rgba(255, 255, 255, 0.8);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.social-bubble::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.social-bubble:hover::before {
		left: 100%;
	}

	.social-bubble:hover {
		transform: translateY(-4px) scale(1.1);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
		color: white;
	}

	.social-bubble.youtube:hover {
		background: rgba(255, 0, 0, 0.2);
		border-color: rgba(255, 0, 0, 0.5);
		box-shadow: 0 20px 40px rgba(255, 0, 0, 0.2);
	}

	.social-bubble.instagram:hover {
		background: linear-gradient(45deg, rgba(225, 48, 108, 0.2), rgba(255, 214, 0, 0.2));
		border-color: rgba(225, 48, 108, 0.5);
		box-shadow: 0 20px 40px rgba(225, 48, 108, 0.2);
	}

	.social-bubble.facebook:hover {
		background: rgba(24, 119, 242, 0.2);
		border-color: rgba(24, 119, 242, 0.5);
		box-shadow: 0 20px 40px rgba(24, 119, 242, 0.2);
	}

	/* Stagger animation for bubbles */
	.social-bubble:nth-child(1) {
		animation-delay: 0s;
	}

	.social-bubble:nth-child(2) {
		animation-delay: 0.2s;
	}

	.social-bubble:nth-child(3) {
		animation-delay: 0.4s;
	}

	/* Abstract animations */
	@keyframes spin-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}

	.animate-spin-slow {
		animation: spin-slow 8s linear infinite;
	}

	.animate-float {
		animation: float 3s ease-in-out infinite;
	}

	/* Subtle hover effects for tags */
	.project-group span:hover {
		background: rgba(255, 0, 128, 0.1);
		border-color: rgba(255, 0, 128, 0.8);
		color: white;
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

	/* Responsive adjustments for mobile */
	@media (max-width: 768px) {
		.social-bubbles {
			top: 1rem;
			right: 1rem;
			gap: 0.75rem;
		}
		
		.social-bubble {
			width: 48px;
			height: 48px;
		}
		
		.social-bubble svg {
			width: 20px;
			height: 20px;
		}

		.instruction-bubble {
			padding: 0.75rem 1rem;
			font-size: 0.75rem;
		}
	}
</style>