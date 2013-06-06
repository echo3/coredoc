package nextapp.coredoc.render.xml;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.TreeSet;

import org.apache.velocity.Template;
import org.apache.velocity.VelocityContext;
import org.apache.velocity.app.Velocity;

import nextapp.coredoc.model.ClassBlock;
import nextapp.coredoc.model.Instance;
import nextapp.coredoc.model.Modifiers;
import nextapp.coredoc.model.Node;
import nextapp.coredoc.render.ClassDO;
import nextapp.coredoc.render.Renderer;

public class XmlRenderer extends Renderer {

    private static final String TEMPLATE_PATH = "nextapp/coredoc/render/xml/template/";

    private ClassBlock[] classes;
    
    public XmlRenderer(Instance instance) {
        super(instance);
        classes = getInstance().getClasses();
    }
    
    private void copySourceFiles(Set<File> sourceFiles) 
    throws Exception {
        File sourceDir = new File(getOutputDirectory(), "source");
        sourceDir.mkdir();
        Iterator<File> sourceFileIt = sourceFiles.iterator();
        while (sourceFileIt.hasNext()) {
            File sourceFile = sourceFileIt.next();
            File targetFile = new File(sourceDir, sourceFile.getName());
            InputStream in = new FileInputStream(sourceFile);
            OutputStream out = new FileOutputStream(targetFile);
            byte[] buffer = new byte[4096];
            int length;
            while ((length = in.read(buffer)) > 0) {
                out.write(buffer, 0, length);
            }
            in.close();
            out.close();
        }
    }
    
    private void copyHomeDirectory() { 
        
    }
    
    public void render(File outputDirectory) 
    throws Exception {
        super.render(outputDirectory);
        
        createIndex();
        Set<File> sourceFiles = new HashSet<File>();

        for (int i = 0; i < classes.length; ++i) {
            ClassDO classDO = getClassRender(classes[i]);
            sourceFiles.add(classes[i].getModule().getFile());
            createClass(classes[i], classDO);
        }
        
        copySourceFiles(sourceFiles);
        
        if (getHomeDirectory() != null) {
            copyHomeDirectory();
        }
    }
    
    public String getName() {
        return "xml";
    }
    
    private void createClass(ClassBlock classBlock, ClassDO classDO)
    throws Exception {
        File indexXml = new File(getOutputDirectory(), "Class." + classBlock.getQualifiedName() + ".xml");
        FileWriter fw = new FileWriter(indexXml);
        
        Template template = Velocity.getTemplate(TEMPLATE_PATH + "Class.xml");        
        VelocityContext context = new VelocityContext();
        context.put("generator", this);
        context.put("qualifiedName", classBlock.getQualifiedName());
        context.put("fileName", classBlock.getModule().getFile().getName());
        context.put("name", classBlock.getName());
        context.put("cr", classDO);
        context.put("containerName", classBlock.getContainerName());
        context.put("description", classBlock.getDocComment() == null ? null : classBlock.getDocComment().getDescription());;
        if ((classBlock.getModifiers() & Modifiers.ABSTRACT) != 0) {
            List<String> modifiers = new ArrayList<String>();
            modifiers.add("Abstract");
            context.put("modifiers", modifiers);
        }

        template.merge(context, fw);
        fw.flush();
        fw.close();
    }

    private void createIndex() 
    throws Exception {
        Node[] namespaces = getInstance().getNamespaces();
        Set<String> namespaceDOs = new TreeSet<String>();
        for (int i = 0; i < namespaces.length; ++i) {
            if (namespaces[i].getName() == null) {
                namespaceDOs.add("%global");
            } else {
                namespaceDOs.add(namespaces[i].getQualifiedName());
            }
        }
        
        File indexXml = new File(getOutputDirectory(), "Index.xml");
        FileWriter fw = new FileWriter(indexXml);
        
        Template template = Velocity.getTemplate(TEMPLATE_PATH + "Index.xml");        

        VelocityContext context = new VelocityContext();
        context.put("title", getTitle());
        if (getHomeDirectory() != null && getHomeDirectory().exists()) {
            context.put("home", "home");
        }
        context.put("namespaces", namespaceDOs);
        context.put("classes", classes);
        
        template.merge(context, fw);
        fw.flush();
        fw.close();
    }
}
