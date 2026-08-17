import os
import time
from playwright.sync_api import sync_playwright

def capture_all():
    # Set the browsers path to D drive to ensure Playwright loads Chromium
    os.environ["PLAYWRIGHT_BROWSERS_PATH"] = "D:\\playwright-browsers"
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)
    
    print("Launching Playwright Chromium...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to standard desktop resolution 1920x1080
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        # Set large default timeout (90 seconds) for slow dev compilations
        page.set_default_navigation_timeout(90000)
        page.set_default_timeout(90000)
        
        # 1. Capture Landing Page (Light Theme)
        try:
            print("Navigating to Home page http://localhost:3000...")
            page.goto("http://localhost:3000")
            time.sleep(12)  # Give Next.js compilation ample time
            
            print("Setting theme to Light...")
            page.evaluate("localStorage.setItem('theme', 'light')")
            page.reload()
            time.sleep(5)
            
            img_landing_light = os.path.join(assets_dir, "landing_page.png")
            page.screenshot(path=img_landing_light)
            print(f"Saved: {img_landing_light}")
        except Exception as e:
            print(f"Error capturing landing page light: {e}")
        
        # 2. Capture Landing Page (Dark Theme)
        try:
            print("Setting theme to Dark...")
            page.evaluate("localStorage.setItem('theme', 'dark')")
            page.reload()
            time.sleep(5)
            
            img_landing_dark = os.path.join(assets_dir, "landing_page_dark.png")
            page.screenshot(path=img_landing_dark)
            print(f"Saved: {img_landing_dark}")
        except Exception as e:
            print(f"Error capturing landing page dark: {e}")
        
        # 3. Capture Visualize Page (Dark Theme)
        try:
            print("Navigating to Visualize page http://localhost:3000/visualize...")
            page.goto("http://localhost:3000/visualize")
            time.sleep(15)  # Give compile time
            
            print("Setting theme to Dark on Visualizer...")
            page.evaluate("localStorage.setItem('theme', 'dark')")
            page.reload()
            time.sleep(5)
            
            img_visualize_dark = os.path.join(assets_dir, "visualize_dark.png")
            page.screenshot(path=img_visualize_dark)
            print(f"Saved: {img_visualize_dark}")
        except Exception as e:
            print(f"Error capturing visualize page dark: {e}")
        
        # 4. Capture Visualize Page (Light Theme)
        try:
            print("Setting theme to Light on Visualizer...")
            page.evaluate("localStorage.setItem('theme', 'light')")
            page.reload()
            time.sleep(5)
            
            img_visualize_light = os.path.join(assets_dir, "visualize_light.png")
            page.screenshot(path=img_visualize_light)
            print(f"Saved: {img_visualize_light}")
        except Exception as e:
            print(f"Error capturing visualize page light: {e}")
        
        # 5. Capture Python Trace Page
        try:
            print("Setting theme to Dark for Trace screen...")
            page.evaluate("localStorage.setItem('theme', 'dark')")
            page.reload()
            time.sleep(5)
            
            img_python_trace = os.path.join(assets_dir, "python_trace.png")
            page.screenshot(path=img_python_trace)
            print(f"Saved: {img_python_trace}")
        except Exception as e:
            print(f"Error capturing python trace screen: {e}")
        
        browser.close()
        print("Screenshots capture completed successfully!")

if __name__ == "__main__":
    capture_all()
