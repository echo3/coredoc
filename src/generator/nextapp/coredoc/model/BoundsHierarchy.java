package nextapp.coredoc.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.regex.Matcher;

import nextapp.coredoc.util.Patterns;

public class BoundsHierarchy {
    
    /**
     * Mapping between block start indices and {@link Bounds} objects. 
     */
    private Map<Integer, Bounds> startIndexToBounds;

    /**
     * Mapping between block brace open indices and {@link Bounds} objects.
     */
    private Map<Integer, Bounds> openIndexToBounds;
    
    /**
     * Retrieves a {@link Bounds} instance based on its open index.
     * 
     * @param openIndex the open index
     * @return the {@link Bounds} object, if one exists with the specified open index 
     */
    public Bounds getBoundsByOpenIndex(int openIndex) {
        return openIndexToBounds.get(openIndex);
    }
    
    /**
     * Retrieves a {@link Bounds} instance based on its start index.
     * Note that this method requires that <code>createStartIndexToBounds()</code> has been
     * invoked previously.
     * 
     * @param openIndex the start index
     * @return the {@link Bounds} object, if one exists with the specified start index
     */
    public Bounds getBoundsByStartIndex(int startIndex) {
        return startIndexToBounds.get(startIndex);
    }
    
    /**
     * Identifies brace pairs within the source file.
     * Creates and populates {@link startIndexToBounds} mapping describing
     * structural boundaries of source module.
     */
    public BoundsHierarchy(String safeSource) {
        openIndexToBounds = new TreeMap<Integer, Bounds>();
        Matcher braceMatcher = Patterns.braces.matcher(safeSource);
        List<Bounds> openBracePairs = new ArrayList<Bounds>();
        
        while (braceMatcher.find()) {
            char braceChar = braceMatcher.group().charAt(0);
            switch (braceChar) {
            case '{':
                openBracePairs.add(new Bounds(openBracePairs.size() == 0 
                        ? null : openBracePairs.get(openBracePairs.size() - 1), braceMatcher.start(), -1));
                break;
            case '}':
                if (openBracePairs.size() == 0) {
                    throw new RuntimeException("Closing brace without opening brace, position: " + braceMatcher.start());
                }
                Bounds bracePair = openBracePairs.remove(openBracePairs.size() - 1);
                bracePair.setCloseIndex(braceMatcher.end());
                openIndexToBounds.put(bracePair.getOpenIndex(), bracePair);
                break;
            default:
                throw new RuntimeException();
            }
        }
        if (openBracePairs.size() > 0) {
            throw new RuntimeException("Closing brace without opening brace, position.");
        }
    }
    
    /**
     * Creates a new {@link Bounds} object with the given open and close indices, and adds it to the hierarchy
     * with the appropriate parent.
     * 
     * @param openIndex the open index of the bounds
     * @param closeIndex the close index of the bounds
     * @return the created {@link Bounds} object
     */
    public Bounds addBounds(int openIndex, int closeIndex) {
        Bounds bounds = new Bounds(findParent(openIndex), openIndex, closeIndex);
        openIndexToBounds.put(openIndex, bounds);
        return bounds;
    }

    /**
     * Creates the {@link startIndexToBounds} map by iterating all bounds objects.
     */
    public void createStartIndexToBounds() {
        startIndexToBounds = new TreeMap<Integer, Bounds>();
        for (Bounds bounds : openIndexToBounds.values()) {
            startIndexToBounds.put(bounds.getStartIndex(), bounds);
        }
    }
    
    /**
     * Finds the parent of the bounds at the given start index.
     * 
     * @param openIndex the open index
     * @return the parent bounds
     */
    private Bounds findParent(int index) {
        Bounds lastBounds = null;
        for (Bounds bounds : openIndexToBounds.values()) {
            if (bounds.getOpenIndex() > index) {
                return lastBounds;
            }
            if (bounds.getCloseIndex() != -1 && bounds.getCloseIndex() > index) {
                lastBounds = bounds;
            }
        }
        return lastBounds;
    }
}
