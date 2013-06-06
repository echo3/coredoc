package nextapp.coredoc.parse;

import java.io.File;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.TreeMap;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import nextapp.coredoc.model.Block;
import nextapp.coredoc.model.Bounds;
import nextapp.coredoc.model.BoundsHierarchy;
import nextapp.coredoc.model.CoreExtendBlock;
import nextapp.coredoc.model.DocComment;
import nextapp.coredoc.model.Instance;
import nextapp.coredoc.model.Module;
import nextapp.coredoc.model.ObjectBlock;
import nextapp.coredoc.model.FieldBlock;
import nextapp.coredoc.util.Patterns;

/**
 * Parses a single source module (file).
 */
public class ModuleParser {

    /**
     * Parses a source module.
     * 
     * @param instance the {@link Instance} to which objects contained in the module should be added
     * @param file the {@link File} containing the module source
     * @param source the source code of the module
     */
    public static Module parse(Instance instance, File file, String source) {
        return new ModuleParser(instance, file, source).parse();
    }
    
    /**
     * Mapping between boundaries within the source file and represented blocks.
     */
    private Map<Bounds, Block> boundsToBlock = new TreeMap<Bounds, Block>();
    
    private BoundsHierarchy boundsHierarchy;
    
    /**
     * The source code of the module.
     */
    private String source;
    
    /**
     * The source code of the module with all free-form text removed, i.e., strings and/or comments.
     */
    private String safeSource;
    
    /**
     * The containing {@link Instance}
     */
    private Instance instance;
    
    /**
     * The {@link Module}.
     */
    private Module module;
    
    /**
     * Set containing all identified block start indices.
     */
    private Set<Integer> blockStartIndices = new TreeSet<Integer>();
    
    /**
     * Creates a new ModuleParser.
     * 
     * @param instance the {@link Instance} to which objects contained in the module should be added
     * @param file the {@link File} containing the module source
     * @param source the source code of the module
     */
    private ModuleParser(Instance instance, File file, String source) {
        super();
        this.instance = instance;
        this.source = source;
        this.safeSource = SourceTextMasker.getSafeSource(source);
        module = new Module(instance, file);
    }
    
    private void assembleStructure() {
        for (Block block : boundsToBlock.values()) {
            if (block.getName().equals(block.getDeclaredName())) {
                if (block.getBounds().getParent() == null) {
                    // Block is top-level.
                    module.addStructureChild(block);
                } else {
                    Block parentBlock = boundsToBlock.get(block.getBounds().getParent());
                    if (parentBlock != null) {
                        parentBlock.addStructureChild(block);
                    }
                }
            } else {
                if (block.getBounds().getParent() == null) {
                    String declaredName = block.getDeclaredName();
                    StringTokenizer nameTokenizer = new StringTokenizer(declaredName, ".");
                    String name = nameTokenizer.nextToken().trim();
                    Block parentBlock = instance.getStructureChild(name);
                    if (parentBlock == null) {
                        throw new RuntimeException("Cannot find parent for: " + declaredName);
                    }
                    while (nameTokenizer.hasMoreTokens()) {
                        name = nameTokenizer.nextToken().trim();
                        if ("prototype".equals(name)) {
                            //FIXME parent block is a class, not a function
                            continue;
                        }
                        if (nameTokenizer.hasMoreTokens()) { // Do not process last token.
                            parentBlock = parentBlock.getStructureChild(name);
                            if (parentBlock == null) {
                                throw new RuntimeException("Cannot find parent for: " + name);
                            }
                        }
                    }
                    parentBlock.addStructureChild(block);
                } else {
                    //FIXME
                }
            }
        }
    }
    
    /**
     * Finds documentation comments and attaches them to blocks.
     */
    private void attachDocComments() {
        Pattern nonWhitespace = Pattern.compile("\\S", Pattern.MULTILINE);
        Matcher matcher = Patterns.docComment.matcher(source);
        while (matcher.find()) {
            String text = matcher.group();
            int start = matcher.start();
            int end = matcher.end();
            Matcher nonWhitespaceMatcher = nonWhitespace.matcher(source);
            nonWhitespaceMatcher.find(end);
            int blockStart = nonWhitespaceMatcher.start();
            Bounds bounds = boundsHierarchy.getBoundsByStartIndex(blockStart);
            if (bounds != null) {
                Block block = boundsToBlock.get(bounds);
                if (block != null) {
                    bounds.setDocStartIndex(start);
                    DocComment docComment = DocCommentParser.parse(text);
                    block.setDocComment(docComment);
                }
            }
        }
    }

    /**
     * Identify all function blocks within module source.
     * Create {@link FieldBlock} objects to represent each function, store in
     * {@link boundsToBlock} map.
     */
    private void createFunctionBlocks() {
        Matcher functionDeclarationMatcher = Patterns.functionDeclaration.matcher(safeSource);
        while (functionDeclarationMatcher.find()) {
            Bounds bounds = boundsHierarchy.getBoundsByOpenIndex(new Integer(functionDeclarationMatcher.end() - 1));
            bounds.setStartIndex(functionDeclarationMatcher.start());
            FieldBlock block = new FieldBlock(module, bounds, true);
            block.setDeclaredName(functionDeclarationMatcher.group(1));
            boundsToBlock.put(bounds, block);
        }

        Matcher functionAssignmentMatcher = Patterns.functionAssignment.matcher(safeSource);
        while (functionAssignmentMatcher.find()) {
            if (!markBlockLoaded(functionAssignmentMatcher.start())) {
                continue;
            }
            Bounds bounds = boundsHierarchy.getBoundsByOpenIndex(new Integer(functionAssignmentMatcher.end() - 1));
            bounds.setStartIndex(functionAssignmentMatcher.start());
            FieldBlock block = new FieldBlock(module, bounds, true);
            block.setDeclaredName(functionAssignmentMatcher.group(1));
            boundsToBlock.put(bounds, block);
        }
    }
    
    /**
     * Identify all field blocks within module source.
     * Create {@link FieldBlock} objects to represent each field, store in
     * {@link boundsToBlock} map.
     */
    private void createFieldBlocks() {
        Matcher propertyAssignmentMatcher = Patterns.fieldAssignment.matcher(safeSource);
        Map<Bounds, Block> fieldMap = new TreeMap<Bounds, Block>();
        while (propertyAssignmentMatcher.find()) {
            if (!markBlockLoaded(propertyAssignmentMatcher.start())) {
                continue;
            }
            
            int startIndex = propertyAssignmentMatcher.start();
            int endIndex = propertyAssignmentMatcher.end();
            Bounds bounds = boundsHierarchy.addBounds(startIndex, endIndex);
            FieldBlock block = new FieldBlock(module, bounds);
            block.setDeclaredName(propertyAssignmentMatcher.group(1));
            fieldMap.put(bounds, block);
        }
        boundsToBlock.putAll(fieldMap);
    }
    
    /**
     * Identify all Core.extend blocks within module source.
     * Create {@link CoreExtendBlock} objects to represent each block, store in
     * {@link boundsToBlock} map.
     */
    private void createCoreExtendBlocks() {
        Matcher coreExtendMatcher = Patterns.coreExtend.matcher(safeSource);
        while (coreExtendMatcher.find()) {
            if (!markBlockLoaded(coreExtendMatcher.start())) {
                continue;
            }
            Bounds bounds = boundsHierarchy.getBoundsByOpenIndex(coreExtendMatcher.end() - 1);
            bounds.setStartIndex(coreExtendMatcher.start());
            CoreExtendBlock block = new CoreExtendBlock(module, bounds);
            block.setDeclaredName(coreExtendMatcher.group(1));
            block.setSuperclassName(coreExtendMatcher.group(2));
            boundsToBlock.put(bounds, block);
        }
    }
    
    /**
     * Identify all object blocks within module source.
     * Create {@link ObjectBlock} objects to represent each block, store in
     * {@link boundsToBlock} map.
     */
    private void createObjectBlocks() {
        Matcher objectLiteralAssignmentMatcher = Patterns.objectLiteralAssignment.matcher(safeSource);
        while (objectLiteralAssignmentMatcher.find()) {
            if (!markBlockLoaded(objectLiteralAssignmentMatcher.start())) {
                continue;
            }
            Bounds bounds = boundsHierarchy.getBoundsByOpenIndex(objectLiteralAssignmentMatcher.end() - 1);
            bounds.setStartIndex(objectLiteralAssignmentMatcher.start());
            ObjectBlock block = new ObjectBlock(module, bounds);            
            block.setDeclaredName(objectLiteralAssignmentMatcher.group(1));
            boundsToBlock.put(bounds, block);
        }
    }

    /**
     * Check and/or marks a block as being loaded, to ensure it is not duplicated.
     * Marks the block as loaded in the event that it is not.
     * 
     * @param startIndex the start index of the block
     * @return true if the block was not yet marked and should be processed, false if it currently exists
     */
    private boolean markBlockLoaded(int startIndex) {
        if (blockStartIndices.contains(startIndex)) {
            return false;
        } else {
            blockStartIndices.add(startIndex);
            return true;
        }
    }

    /**
     * Parses the module source.
     * 
     * @return the {@link Module} the module model
     */
    private Module parse() {
        boundsHierarchy = new BoundsHierarchy(safeSource);
        
        createFunctionBlocks();
        createCoreExtendBlocks();
        createObjectBlocks();
        createFieldBlocks();
        
        assembleStructure();
        
        boundsHierarchy.createStartIndexToBounds();
        
        attachDocComments();
        
        return module;
    }
}
