package nextapp.coredoc.model;

import java.io.File;
import java.util.HashSet;
import java.util.Set;

/**
 * A representation of a single module, i.e., file, containing JavaScript code.
 */
public class Module {
    
    /** The containing {@link Instance}. */
    private Instance instance;
    
    /** The filesystem file. */
    private File file;
    
    /** The {@link Block}s contained within the module. */
    private Set<Block> moduleBlocks = new HashSet<Block>();
    
    /** 
     * Creates a new Module.
     * 
     * @param instance the containing {@link Instance}
     * @param file the filesystem file
     */
    public Module(Instance instance, File file) {
        super();
        this.instance = instance;
        this.file = file;
    }
    
    public void addStructureChild(Block block) {
        moduleBlocks.add(block);
        instance.addStructureChild(block);
    }
    
    public File getFile() {
        return file;
    }
    
    public Instance getInstance() {
        return instance;
    }
}
