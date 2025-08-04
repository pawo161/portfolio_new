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

	// Scroll tracking for text animation
	let scrollY = 0;
	let innerHeight = 0;
	
	// Background brightness detection for text readability
	let backgroundBrightness = 0.5; // Default middle brightness
	let adaptiveTextClass = 'text-white';
	let adaptiveSubTextClass = 'text-gray-300';

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
        try {
            const response = await fetch(`${base}/portfolio.json`);
            const portfolioData = await response.json();
            
            // Assign data to respective variables
            personalData = portfolioData.personal;
            musicProjects = portfolioData.musicProjects;
            programmingProjects = portfolioData.programmingProjects;

            // Update the 3D scene with project data
            updateProjects(musicProjects, programmingProjects);

			// Start brightness sampling
			brightnessInterval = setInterval(sampleCanvasBrightness, 200);

        } catch (error) {
            console.error('Failed to fetch portfolio data:', error);
        }
		
		return () => {
			if (brightnessInterval) {
				clearInterval(brightnessInterval);
			}
		};
    });
</script>

<svelte:window bind:scrollY bind:innerHeight />

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

<!-- Seamless flowing content -->
<div class="seamless-flow">
	<!-- Hero Section -->
	<div class="hero-section h-[75vh] flex flex-col justify-center relative">
		<div class="group z-10">
			<h2 class="text-6xl font-black tracking-widest ml-20 adaptive-text" 
				class:text-white={adaptiveTextClass === 'text-white'}
				class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>{personalData.name}</h2>
			<h2 class="text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text"
				class:text-white={adaptiveTextClass === 'text-white'}
				class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>&nbsp;{personalData.title} and <mark id="revelation" style="background: none; color: #FF0080;" class="font-black">guitarist.</mark></h2>
			<h2 class="text-2xl font-thin tracking-widest mt-6 ml-20 adaptive-text"
				class:text-white={adaptiveTextClass === 'text-white'}
				class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>&nbsp;{personalData.bio}</h2>
		</div>
	</div>

	<!-- Projects naturally flowing from bottom of page with biographical text -->
	<div class="projects-flow relative">
		<!-- Main content container -->
		<div class="lg:flex lg:gap-8 xl:gap-16 2xl:gap-24">
			<!-- Left side - Projects -->
			<div class="projects-container lg:w-[45%] xl:w-[40%] 2xl:w-[35%]">
				<!-- Music Projects -->
				{#if musicProjects.length > 0}
					<div class="project-group ml-24 mb-32">
						<h3 class="text-3xl font-black tracking-widest mb-16 opacity-80 adaptive-text"
							class:text-white={adaptiveTextClass === 'text-white'}
							class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
							<mark style="background: none;" class="text-[#FF0080]">//</mark> MUSIC
						</h3>
						{#each musicProjects as data, i}
							<div id="music-{i}" class="group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out mr-10 w-[20rem] md:w-[40rem] lg:w-[30rem] xl:w-[40rem] project-card" in:fade={{ delay: 250 * i, duration: 1000 }}>
								{#if data.links}
									<a
										href={data.links.youtube || data.links.bandcamp || data.links.soundcloud || data.links.facebook}
										rel="noopener noreferrer"
										target="_blank"
										class="block h-auto px-0 py-0 tracking-widest transition-all duration-300 transform hover:scale-[1.02] cursor-pointer"
										>
										<h2 class="text-xl font-black mb-4 hover:text-[#FF0080] transition-colors duration-300 adaptive-text"
											class:text-white={adaptiveTextClass === 'text-white'}
											class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
											<mark style="background: none;" class="text-[#FF0080]">.</mark>&nbsp;{data.title}
										</h2>
										<h2 class="text-md font-base mb-6 leading-relaxed adaptive-subtext"
											class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
											class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
											class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>{data.description}</h2>
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
							<div id="programming-{i}" class="group my-20 translate-y-0 hover:-translate-y-8 duration-[400ms] ease-in-out mr-10 w-[20rem] md:w-[40rem] lg:w-[30rem] xl:w-[40rem] project-card" in:fade={{ delay: 250 * (i + musicProjects.length), duration: 1000 }}>
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
			</div>

			<!-- Right side - Biographical text (hidden on mobile/tablet) -->
			<div class="biographical-text hidden lg:block lg:flex-1">
				<div class="bio-flow-container" 
					 style="opacity: {Math.max(0, Math.min(1, (scrollY - innerHeight * 0.6) / (innerHeight * 0.2)))}">
					
					<div class="bio-content-flow">
						<h3 class="text-2xl font-black tracking-widest mb-8 opacity-80 adaptive-text"
							class:text-white={adaptiveTextClass === 'text-white'}
							class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
							<mark style="background: none;" class="text-[#FF0080]">//</mark> O MNIE
						</h3>
						
						<div class="bio-text text-sm leading-relaxed space-y-6 adaptive-subtext"
							 class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
							 class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
							 class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>
							<p>Paweł Knorps jest aktywnym muzykiem na polskiej i duńskiej scenie. Niedawno obronił dyplom magisterski z gitary jazzowej na poznańskiej Akademii, a niedługo później również dyplom magisterski z kompozycji jazzowej na prestiżowej uczelni Danish National Academy of Music w Odense.</p>
							
							<p>Jest głównie muzykiem improwizującym – zawodowo gitarzystą, ale również basistą, producentem muzycznym i kompozytorem. Interesuje go szczególnie tworzenie muzyki, która przekracza utrwalone granice. Kluczowa jest dla niego swobodna ekspresja i niczym nieskrępowana kreatywność.</p>
							
							<p>Jego nowy projekt to oryginalny jazzowy materiał grany z poznańskimi jazzmanami – Krzysztofem Dysem, Dawidem Tokłowiczem, Piotrem Cienkowskim, Kajetanem Pilarskim. Działają pod nazwą <span class="text-[#FF0080] font-semibold">Pawel Knorps Group</span>, jest to debiutancki projekt Pawła jako lidera i kompozytora muzyki jazzowej.</p>
							
							<p>Są jednym z sześciu finalistów Blue Note Competition 2024, gdzie zostali wybrani spośród prawie 50 zespołów jazzowych z Europy.</p>
							
							<p>Paweł jest głęboko zaangażowany w tworzenie miejskiej tkanki kulturalnej Poznania. Od 2019 roku jest jedną z osób zarządzających i tworzących <span class="text-[#FF0080] font-semibold">Kołorking Muzyczny</span> na Św. Marcinie 75.</p>
							
							<p>Zorganizował tam kilkadziesiąt wydarzeń – koncertów, warsztatów, spotkań, prób muzycznych. Jest to oddolna inicjatywa, która wspiera społeczeństwo w rozwoju muzycznym bez barier – bez kosztów finansowych i ze wsparciem mentorskim.</p>
							
							<p>Jego poboczną pasją jest produkcja i tworzenie muzyki elektronicznej jako <span class="text-[#FF0080] font-semibold">enthymeme</span>. Grał improwizowaną, eksperymentalną tkankę dźwiękową w takich klubach jak: Dom Technika, Farby, My, Mózg Bydgoszcz.</p>
							
							<p>Obecnie po powrocie do Poznania w czerwcu 2024 ze studiów w Danii dołączył do poznańskich projektów: Milomi, SNY, MUIZK NVA LAB, Domsun.</p>
						</div>

						<div class="achievements-section mt-12">
							<h3 class="text-xl font-black tracking-widest mb-6 opacity-80 adaptive-text"
								class:text-white={adaptiveTextClass === 'text-white'}
								class:text-gray-900={adaptiveTextClass === 'text-gray-900'}>
								<mark style="background: none;" class="text-[#FF0080]">//</mark> DOKONANIA
							</h3>
							<div class="achievements-list text-xs leading-relaxed space-y-3 adaptive-subtext"
								 class:text-gray-300={adaptiveSubTextClass === 'text-gray-300'}
								 class:text-gray-200={adaptiveSubTextClass === 'text-gray-200'}
								 class:text-gray-700={adaptiveSubTextClass === 'text-gray-700'}>
								<div class="achievement-item">
									<span class="text-[#FF0080] font-bold">2021</span> - wygrana O K N O | Mini-konkurs na kreatywne akcje w oknie Kołorkingu muzycznego
								</div>
								<div class="achievement-item">
									<span class="text-[#FF0080] font-bold">2020-2021</span> nagroda od Teatru Muzycznego w Poznaniu w Konkursie „Ciąg dalszy nastąpi cz. II" za projekt „Performance audiowizualny nawiązujący do sieci neuronowej"
								</div>
								<div class="achievement-item">
									<span class="text-[#FF0080] font-bold">2022</span> - stypendium programu Erasmus na studia w Syddansk musikkonservatorium w Odense, gdzie później zaczął pełnoprawne studia magisterskie
								</div>
								<div class="achievement-item">
									<span class="text-[#FF0080] font-bold">2024</span> – finał Blue Note Competition 2024 z autorskim projektem kompozytorskim Pawel Knorps Group
								</div>
								<div class="achievement-item">
									<span class="text-[#FF0080] font-bold">2024</span> - otrzymał Stypendium Twórcze Miasta Poznania za projekt „Jazzowa tkanka miasta – album inspirowany dźwiękami Poznania"
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

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

	/* Biographical text styling */
	.biographical-text {
		position: relative;
	}

	.bio-flow-container {
		position: sticky;
		top: 2rem;
		padding: 2rem;
		height: calc(100vh - 4rem);
		overflow-y: auto;
		transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.bio-content-flow {
		background: transparent;
		border: none;
		padding: 0;
	}

	.bio-text p {
		text-align: justify;
		font-family: system-ui, -apple-system, sans-serif;
		font-weight: 300;
		line-height: 1.7;
		margin-bottom: 1.5rem;
	}

	.bio-text span {
		font-weight: 600;
	}

	.achievements-section {
		border-top: 1px solid rgba(255, 0, 128, 0.2);
		padding-top: 2rem;
	}

	.achievements-list {
		max-height: none;
	}

	.achievement-item {
		padding: 0.75rem 0;
		border-left: 2px solid rgba(255, 0, 128, 0.3);
		padding-left: 1rem;
		margin-left: 0.5rem;
		transition: all 0.3s ease;
		line-height: 1.5;
	}

	.achievement-item:hover {
		border-left-color: rgba(255, 0, 128, 0.8);
		padding-left: 1.5rem;
		background: rgba(255, 0, 128, 0.05);
	}

	/* Custom scrollbar for bio text */
	.bio-flow-container::-webkit-scrollbar {
		width: 4px;
	}

	.bio-flow-container::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 2px;
	}

	.bio-flow-container::-webkit-scrollbar-thumb {
		background: rgba(255, 0, 128, 0.5);
		border-radius: 2px;
	}

	.bio-flow-container::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 0, 128, 0.8);
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
	}

	/* Large screen adjustments */
	@media (min-width: 1024px) {
		.projects-container {
			padding-right: 2rem;
		}
	}
	/* Adaptive text colors with smooth transitions */
	.adaptive-text, .adaptive-subtext {
		transition: color 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		text-shadow: 0 0 20px rgba(0, 0, 0, 0.7);
	}

	/* Enhanced text shadow for better readability */
	.adaptive-text {
		text-shadow: 
			0 0 10px rgba(0, 0, 0, 0.8),
			0 2px 4px rgba(0, 0, 0, 0.6),
			0 1px 2px rgba(0, 0, 0, 0.9);
	}

	.adaptive-subtext {
		text-shadow: 
			0 0 8px rgba(0, 0, 0, 0.7),
			0 1px 3px rgba(0, 0, 0, 0.5);
	}

	/* Dynamic brightness-based backdrop */
	.project-card {
		backdrop-filter: blur(2px);
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.bio-flow-container {
		backdrop-filter: blur(3px);
		background: rgba(0, 0, 0, 0.1);
		border-left: 1px solid rgba(255, 255, 255, 0.1);
	}
</style>
