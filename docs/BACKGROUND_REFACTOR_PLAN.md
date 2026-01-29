# Background & Level Aesthetics Refactor Plan

## 1. Vision: "Painting a Picture"
Move from random, independent object placement to **Scene Composition**. The background should tell a story of a journey through different "zones" rather than being a random soup of icons.

## 2. Core Concepts

### A. The "Zone" System (Vertical Anchoring)
Instead of random heights, objects will be anchored to specific vertical zones to create a realistic horizon:
*   **Sky Zone (Top 0-25%):** For clouds, binary code, or distant birds.
*   **Horizon Zone (Middle 25-70%):** For distant buildings, mountains, or office skylines. These should be "anchored" to a common base line.
*   **Ground Decor (Foreground):** Items like trees, plants, and rocks must be explicitly tied to platform coordinates so they never "float."

### B. "Scene Clusters" (Horizontal Grouping)
Instead of `total_objects = width / 200`, we will use "Scenes":
*   **Scene Definition:** A group of 3-5 related objects (e.g., a "City Block", a "Cloud Bank", or a "Server Rack Row").
*   **Placement:** Scenes will be placed every 800-1200 pixels with intentional **Negative Space** (gaps) in between.
*   **Visual Landmarks:** Every level will have 1-2 "Unique Landmarks" (e.g., a giant Corporate HQ in the city level) that appear only once to signify progress.

### C. Multi-Layer Parallax (Nintendo Style)
Divide the background entities into two distinct depth layers:
1.  **Far Layer (Depth 0.1):** Moves at 10% of player speed (Distant mountains/clouds). Higher transparency (10-15%).
2.  **Mid Layer (Depth 0.3):** Moves at 30% of player speed (Buildings/Trees). Lower transparency (20-30%).
*   *Implementation Note:* This provides immediate 2D depth without changing any sprites.

## 3. Level-Specific Aesthetic Themes

| Level | Theme | Background Elements | Ground Decor |
| :--- | :--- | :--- | :--- |
| **1: Garage** | Bright Start | Fluffy Cloud Clusters (High) | Bushes, Flowers (On Platforms) |
| **2: City** | The Hustle | Overlapping City Blocks (Horizon) | Traffic Lights, Signs |
| **3: Tech** | The Matrix | Cascading Binary "Curtains" | Servers, Cables |
| **4: Finance**| The Burnout | Dark Graphs / Red Downward Arrows | Calculators, "Burning" Paper |
| **5: Victory**| IPO / Growth | Golden Sparkle Clusters | Trophies, Briefcases |

## 4. Technical Implementation Steps (Phase 1)
1.  **Update `levelGenerator.ts`:**
    *   Replace `bgCount` loop with a `sceneCount` loop.
    *   Create "Scene Templates" (pre-defined offsets for groups of objects).
    *   Implement "Zone" constraints for Y-coordinates.
2.  **Update `GameCanvas.tsx`:**
    *   Modify `drawEntity` to accept a `parallaxFactor` based on the entity's Z-index or type.
    *   Adjust render order to ensure Far Layer -> Mid Layer -> Platforms -> Player.

## 5. Success Criteria
*   [ ] No more "floating" buildings in mid-air.
*   [ ] Clear vertical separation between clouds and ground items.
*   [ ] Objects are grouped into logical "clusters" with breathing room in between.
*   [ ] Background moves at two different speeds to create a sense of depth.
